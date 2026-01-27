import fs from 'fs'
import fsPromises from 'fs/promises'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import Papa from 'papaparse'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

const execAsync = promisify(exec)

export interface Lesson {
  textId: string
  index: number
  content: string
  xx: string
}

// ====================== R2 配置 ======================
const s3Client = new S3Client({
  region: 'auto',
  endpoint: 'https://xxxx.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: 'xxxx',
    secretAccessKey: 'xxxx',
  },
  forcePathStyle: true,
})
// ====================================================

/**
 * 获取 git 相对于 HEAD 的变更文件列表（项目根相对路径）
 */
async function getGitChangedFiles(): Promise<string[]> {
  try {
    const params: string =
      'public/lessons/ public/translations/ public/audios/ public/jsons/'
    const script: string = `git diff --name-only HEAD -- ${params}`
    const { stdout } = await execAsync(script)
    const files = stdout
      .trim()
      .split('\n')
      .filter((line) => line.trim() !== '')
      .map((f) => f.trim())
    return files
  } catch (err: any) {
    console.warn(
      '获取 git 变更列表失败（可能无 HEAD 或不在 git 仓库）',
      err.message || err
    )
    return []
  }
}

/**
 * 上传逻辑：根据 git 变更列表 + 路径前缀匹配，上传属于 sourceBaseDir（含子目录）的文件
 */
async function simpleUpload(
  sourceBaseDir: string,
  sourceFilename: string,
  bucket: string,
  keyPrefix: string
) {
  const isBulk = sourceFilename === '*'

  let prefix = keyPrefix.trim()
  if (prefix && !prefix.endsWith('/')) {
    prefix += '/'
  }

  const baseDir = path.resolve(sourceBaseDir)
  const baseDirRelative = path.relative(process.cwd(), baseDir) // 项目根到 baseDir 的相对路径

  // 获取 git 变更文件（相对项目根）
  const gitChanged = await getGitChangedFiles()

  const filesToUpload: { fullPath: string; key: string }[] = []

  // 先在 simpleUpload 函数最开头添加：获取 git 仓库根
  let gitRoot = process.cwd()
  try {
    const { stdout } = await execAsync('git rev-parse --show-toplevel')
    gitRoot = stdout.trim()
  } catch (err) {
    console.warn('无法获取 git 根目录，使用当前工作目录作为 fallback', err)
  }

  // 然后使用 gitRoot 来计算相对路径
  const baseDirAbs = path.resolve(sourceBaseDir)
  const baseDirRelativeToGit = path
    .relative(gitRoot, baseDirAbs)
    .replace(/\\/g, '/')

  // 批量模式判断逻辑（使用统一的 / 风格路径）
  if (isBulk) {
    for (const relFromGitRoot of gitChanged) {
      // 统一使用正斜杠比较
      const normalizedRel = relFromGitRoot.replace(/\\/g, '/')

      // 判断是否属于 baseDirRelativeToGit 或其子目录
      if (
        normalizedRel === baseDirRelativeToGit ||
        normalizedRel.startsWith(baseDirRelativeToGit + '/')
      ) {
        // 计算相对于 baseDir 的路径（用于 key）
        const relInDir = path.relative(baseDirRelativeToGit, normalizedRel)
        const fullPath = path.join(gitRoot, normalizedRel)
        const key = prefix + relInDir.replace(/\\/g, '/')

        try {
          await fsPromises.access(fullPath)
          filesToUpload.push({ fullPath, key })
        } catch {
          console.log(`文件访问失败，跳过: ${normalizedRel}`)
        }
      }
    }
  } else {
    // 单文件模式
    const targetRelToGit = path
      .join(baseDirRelativeToGit, sourceFilename)
      .replace(/\\/g, '/')
    if (gitChanged.some((rel) => rel.replace(/\\/g, '/') === targetRelToGit)) {
      const fullPath = path.join(gitRoot, targetRelToGit)
      const key = prefix + sourceFilename
      try {
        await fsPromises.access(fullPath)
        filesToUpload.push({ fullPath, key })
      } catch {
        return
      }
    } else {
    }
  }

  if (filesToUpload.length === 0) {
    return
  }

  let uploadedCount = 0

  for (const { fullPath, key } of filesToUpload) {
    try {
      const content = await fsPromises.readFile(fullPath)

      let contentType = 'application/octet-stream'
      const ext = path.extname(fullPath).toLowerCase()
      if (ext === '.csv') contentType = 'text/csv; charset=utf-8'
      else if (ext === '.json') contentType = 'application/json; charset=utf-8'
      else if (ext === '.mp3') contentType = 'audio/mpeg'

      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: content,
        ContentType: contentType,
        ACL: 'public-read',
      })

      await s3Client.send(command)

      console.log(`✔️ ${bucket}/${key}`)
      uploadedCount++
    } catch (err) {
      console.error(`❌ ${bucket}/${key}`, err)
    }
  }
}

// ────────────────────────────────────────────────
// 以下为原有的业务逻辑，保持不变
// ────────────────────────────────────────────────

const lessonPathFrom: string = './public/jsons/lesson-contents.csv'
const translationPathFrom: string = './public/jsons/lesson-translations.csv'

const jsonBucket: string = 'japanese-json'
const audioBucket: string = 'japanese-audio'

let contents: Lesson[] = []
Papa.parse<Lesson>(fs.readFileSync(lessonPathFrom).toString(), {
  header: true,
  skipEmptyLines: true,
  dynamicTyping: true,
  complete: (result) => {
    contents = result.data
  },
  error: (err: any) => {
    console.log(`Error: ${err}`)
  },
})

let indexArr = [...new Set(contents.map((c) => c.index))].sort()

for (let index of indexArr) {
  const parts = contents.filter((c) => c.index === index)
  const result: string[] = ['textId,index,content']
  parts.forEach((lesson) =>
    result.push(`${lesson.textId},${lesson.index},${lesson.content}`)
  )
  fs.writeFileSync(`./public/lessons/${index}.csv`, result.join('\n'))
}

;(async () => {
  await simpleUpload('./public/lessons', '*', jsonBucket, 'lessons')
})()

// translations 部分同理
let translations: Lesson[] = []
Papa.parse<Lesson>(fs.readFileSync(translationPathFrom).toString(), {
  header: true,
  skipEmptyLines: true,
  dynamicTyping: true,
  complete: (result) => {
    translations = result.data
  },
  error: (err: any) => {},
})

for (let index of indexArr) {
  const parts = translations.filter((c) => c.index === index)
  const result: string[] = ['textId,index,content']
  parts.forEach((lesson) =>
    result.push(`${lesson.textId},${lesson.index},${lesson.content}`)
  )
  fs.writeFileSync(`./public/translations/${index}.csv`, result.join('\n'))
}

;(async () => {
  await simpleUpload('./public/translations', '*', jsonBucket, 'translations')
})()

// pure content 部分
function extractPlainText(input: string): string {
  return input
    .replace(/\[([^\]]*?)‖[^\]]*?\]/g, '$1')
    .replace(/\{([^|}]+)\|[^}]+\}/g, '$1')
    .replace(/\s+/g, '')
}

let pureContents: Lesson[] = []
Papa.parse<Lesson>(fs.readFileSync(lessonPathFrom).toString(), {
  header: true,
  skipEmptyLines: true,
  dynamicTyping: true,
  complete: (result) => {
    pureContents = result.data
  },
  error: (err: any) => {
    console.log(`Error: ${err}`)
  },
})

const pureResult: string[] = ['textId,index,content']
for (let content of pureContents) {
  pureResult.push(
    `${content.textId},${content.index},${extractPlainText(content.content)}`
  )
}
fs.writeFileSync(
  `./public/jsons/lesson-content-pure.csv`,
  pureResult.join('\n')
)
;(async () => {
  await simpleUpload('./public/jsons', '*', jsonBucket, '')
})()
;(async () => {
  await simpleUpload('./public/audios', '*', audioBucket, '')
})()
