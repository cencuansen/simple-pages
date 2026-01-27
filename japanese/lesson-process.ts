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
}

// ====================== R2 配置 ======================
const s3Client = new S3Client({
  region: 'auto',
  endpoint: 'https://你的account-id.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: '你的 access key id',
    secretAccessKey: '你的 secret access key',
  },
  forcePathStyle: true,
})
// ====================================================

/**
 * 判断文件内容是否与 git HEAD 中的版本完全相同
 * @returns true = 内容完全一致（无需上传）
 *         false = 内容有差异 / 文件未被 git 追踪 / 其他情况（视为需要上传）
 */
async function isContentUnchanged(fullPath: string): Promise<boolean> {
  try {
    // git diff --quiet HEAD -- file
    // 返回码 0 = 无差异，1 = 有差异，其他 = 错误
    await execAsync(`git diff --quiet HEAD -- "${fullPath}"`)
    return true
  } catch (err: any) {
    if (err.code === 1) {
      // 有差异
      return false
    }
    // 其他情况（未追踪、新文件、不是 git 仓库等） → 视为需要上传
    console.warn(
      `git diff 检查异常，视为需上传: ${fullPath}`,
      err.message || err
    )
    return false
  }
}

/**
 * 上传逻辑（基于 git 判断内容是否真的变化）
 */
async function simpleUpload(
  sourceBaseDir: string,
  sourceFilename: string,
  bucket: string,
  keyPrefix: string,
  since: Date
) {
  const isBulk = sourceFilename === '*'

  let prefix = keyPrefix.trim()
  if (prefix && !prefix.endsWith('/')) {
    prefix += '/'
  }

  const baseDir = path.resolve(sourceBaseDir)
  const filesToUpload: { fullPath: string; key: string }[] = []

  if (isBulk) {
    const entries = await fsPromises.readdir(baseDir, { withFileTypes: true })
    for (const entry of entries) {
      if (!entry.isFile()) continue
      const fullPath = path.join(baseDir, entry.name)
      const key = prefix + entry.name
      filesToUpload.push({ fullPath, key })
    }
  } else {
    const fullPath = path.join(baseDir, sourceFilename)
    try {
      await fsPromises.access(fullPath)
      const key = prefix + sourceFilename
      filesToUpload.push({ fullPath, key })
    } catch {
      console.log(`文件不存在，跳过: ${sourceFilename}`)
      return
    }
  }

  if (filesToUpload.length === 0) {
    console.log('没有找到需要处理的文件')
    return
  }

  console.log(`\n检查 ${filesToUpload.length} 个文件（基于 git diff）...`)

  let uploadedCount = 0
  let skippedCount = 0

  for (const { fullPath, key } of filesToUpload) {
    try {
      // 可选：先用 mtime 粗筛（加速）
      const stat = await fsPromises.stat(fullPath)
      if (stat.mtime < since) {
        console.log(`mtime 未更新，跳过 → ${key}`)
        skippedCount++
        continue
      }

      // 核心：用 git 判断内容是否真的变化
      const unchanged = await isContentUnchanged(fullPath)

      if (unchanged) {
        console.log(`内容与 HEAD 一致，跳过 → ${key}`)
        skippedCount++
        continue
      }

      // 需要上传
      const content = await fsPromises.readFile(fullPath)

      let contentType = 'application/octet-stream'
      const ext = path.extname(fullPath).toLowerCase()
      if (ext === '.csv') contentType = 'text/csv; charset=utf-8'
      else if (ext === '.json') contentType = 'application/json; charset=utf-8'

      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: content,
        ContentType: contentType,
        // ACL: 'public-read',  // 如需公开访问可取消注释
      })

      await s3Client.send(command)

      console.log(`上传成功（内容有变化）→ ${key}`)
      uploadedCount++
    } catch (err) {
      console.error(`处理失败 ${key}:`, err)
    }
  }

  console.log(
    `\n本次处理完成：上传 ${uploadedCount} 个，跳过 ${skippedCount} 个`
  )
}

// ────────────────────────────────────────────────
// 以下为原有的业务逻辑，保持不变
// ────────────────────────────────────────────────

const lessonPathFrom: string = './public/jsons/lesson-contents.csv'
const translationPathFrom: string = './public/jsons/lesson-translations.csv'

const jsonBucket: string = 'japanese-json'
const audioBucket: string = 'japanese-audio'

const now = new Date()

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
  await simpleUpload('./public/lessons', '*', jsonBucket, 'lessons', now)
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
  await simpleUpload(
    './public/translations',
    '*',
    jsonBucket,
    'translations',
    now
  )
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
  await simpleUpload(
    './public/jsons',
    'lesson-content-pure.csv',
    jsonBucket,
    '',
    now
  )
})()
