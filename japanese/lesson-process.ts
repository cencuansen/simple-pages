import fs from 'fs/promises'
import { createReadStream, readFileSync } from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import Papa from 'papaparse'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

const execAsync = promisify(exec)

// ====================== 配置中心 ======================
const CONFIG = {
  R2: {
    region: 'auto',
    endpoint: 'https://xxxx.r2.cloudflarestorage.com',
    credentials: {
      accessKeyId: 'xxxx',
      secretAccessKey: 'xxxx',
    },
  },
  PATHS: {
    lessons: './public/lessons',
    translations: './public/translations',
    audios: './public/audios',
    jsons: './public/jsons',
  },
  BUCKETS: {
    JSON: 'japanese-json',
    AUDIO: 'japanese-audio',
  },
}

const s3Client = new S3Client({ ...CONFIG.R2, forcePathStyle: true })

// ====================== 工具函数 ======================

/** 快速解析 CSV */
const parseCSV = <T>(filePath: string): Promise<T[]> => {
  const content = readFileSync(filePath, 'utf8')
  return new Promise((resolve) => {
    Papa.parse<T>(content, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (res) => resolve(res.data),
    })
  })
}

/** 获取 Git 变更，返回规范化的相对路径集合 */
async function getGitChanges(): Promise<Set<string>> {
  try {
    const searchDirs = Object.values(CONFIG.PATHS).join(' ')
    const { stdout } = await execAsync(
      `git status --porcelain -u -- ${searchDirs}`
    )
    return new Set(
      stdout
        .split('\n')
        .filter((line) => line.length > 3)
        .map((line) => line.slice(3).trim().replace(/\\/g, '/'))
    )
  } catch {
    return new Set()
  }
}

/** 文本清洗 */
function cleanText(input: string): string {
  return input
    .replace(/\[([^\]]*?)‖[^\]]*?\]/g, '$1') // 处理拼音/假名标记
    .replace(/\{([^|}]+)\|[^}]+\}/g, '$1') // 处理其他标记
    .replace(/\s+/g, '')
}

// ====================== 核心上传类 ======================

class Uploader {
  private gitChanges: Set<string> = new Set()

  async init() {
    this.gitChanges = await getGitChanges()
  }

  async uploadDir(localDir: string, bucket: string, remotePrefix: string) {
    // 1. 获取当前待处理目录的绝对路径
    const absDir = path.resolve(localDir)

    // 2. 获取 Git 根目录的绝对路径
    let gitRoot = ''
    try {
      const { stdout } = await execAsync('git rev-parse --show-toplevel')
      gitRoot = path.resolve(stdout.trim()) // 转换为绝对路径
    } catch (e) {
      gitRoot = process.cwd()
    }

    // 3. 过滤出属于当前目录的文件
    const filesToUpload = Array.from(this.gitChanges).filter((relPath) => {
      // 将 Git 返回的相对路径转为绝对路径
      const fileAbsPath = path.resolve(gitRoot, relPath)
      // 检查该文件是否位于我们要上传的目录(absDir)之下
      return fileAbsPath.startsWith(absDir)
    })

    for (const relPath of filesToUpload) {
      const fullPath = path.resolve(gitRoot, relPath)
      // 4. 计算 Key：只需要文件相对于 absDir 的部分
      // 例如：absDir 是 /web/public/lessons, fullPath 是 /web/public/lessons/1.csv
      // relInDir 得到的就是 1.csv
      const relInDir = path.relative(absDir, fullPath)
      const key = path.join(remotePrefix, relInDir).replace(/\\/g, '/')

      try {
        const body = await fs.readFile(fullPath)
        const ext = path.extname(fullPath).toLowerCase()
        const contentType =
          {
            '.csv': 'text/csv; charset=utf-8',
            '.json': 'application/json; charset=utf-8',
            '.mp3': 'audio/mpeg',
          }[ext] || 'application/octet-stream'

        await s3Client.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: body,
            ContentType: contentType,
          })
        )
        console.log(`✔️  Uploaded: ${key}`)
      } catch (e) {
        console.error(`❌  Failed: ${key}`, e)
      }
    }
  }
}

// ====================== 主逻辑 ======================

async function main() {
  const lessonPath = path.join(CONFIG.PATHS.jsons, 'lesson-contents.csv')
  const transPath = path.join(CONFIG.PATHS.jsons, 'lesson-translations.csv')

  console.log('🚀  Starting sync process...')

  // 1. 数据准备
  const [lessons, translations] = await Promise.all([
    parseCSV<any>(lessonPath),
    parseCSV<any>(transPath),
  ])

  const indexArr = [...new Set(lessons.map((l) => l.index))].sort(
    (a, b) => a - b
  )

  // 2. 文件处理 (并行写入提升效率)
  const writeTasks: Promise<void>[] = []

  indexArr.forEach((index) => {
    // 处理 Lesson CSV
    const lContent = lessons.filter((l) => l.index === index)
    const lRows = [
      'textId,index,content',
      ...lContent.map((l) => `${l.textId},${l.index},${l.content}`),
    ]
    writeTasks.push(
      fs.writeFile(`${CONFIG.PATHS.lessons}/${index}.csv`, lRows.join('\n'))
    )

    // 处理 Translation CSV
    const tContent = translations.filter((t) => t.index === index)
    const tRows = [
      'textId,index,content',
      ...tContent.map((t) => `${t.textId},${t.index},${t.content}`),
    ]
    writeTasks.push(
      fs.writeFile(
        `${CONFIG.PATHS.translations}/${index}.csv`,
        tRows.join('\n')
      )
    )
  })

  // 处理 Pure Content
  const pureRows = [
    'textId,index,content',
    ...lessons.map((l) => `${l.textId},${l.index},${cleanText(l.content)}`),
  ]
  writeTasks.push(
    fs.writeFile(
      `${CONFIG.PATHS.jsons}/lesson-content-pure.csv`,
      pureRows.join('\n')
    )
  )

  await Promise.all(writeTasks)
  console.log('📂  Files generated.')

  // 3. 执行同步上传
  const uploader = new Uploader()
  await uploader.init()

  await Promise.all([
    uploader.uploadDir(CONFIG.PATHS.lessons, CONFIG.BUCKETS.JSON, 'lessons'),
    uploader.uploadDir(
      CONFIG.PATHS.translations,
      CONFIG.BUCKETS.JSON,
      'translations'
    ),
    uploader.uploadDir(CONFIG.PATHS.jsons, CONFIG.BUCKETS.JSON, ''),
    uploader.uploadDir(CONFIG.PATHS.audios, CONFIG.BUCKETS.AUDIO, ''),
  ])

  console.log('✅  All tasks completed.')
}

main().catch(console.error)
