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
 * 判斷檔案內容是否「有改變」或「是新增檔案」
 *
 * @returns
 *   true  → 需要上傳（檔案內容有改變、或檔案是新增的、或 git 無法判斷）
 *   false → 不需要上傳（檔案與 HEAD 完全一致，沒有任何改變）
 */
async function shouldUpload(fullPath: string): Promise<boolean> {
  try {
    // git diff --quiet HEAD -- file
    // 返回碼 0 = 完全一致（無差異）
    await execAsync(`git diff --quiet HEAD -- "${fullPath}"`)

    // 如果執行到這裡，代表 git diff 返回 0 → 內容完全相同
    return false // 不需要上傳
  } catch (err: any) {
    if (err.code === 1) {
      // git diff 返回 1 → 內容有差異（已修改或新增後已 commit 但與 HEAD 不同）
      return true
    }

    // 其他情況：
    // - 檔案未被 git 追蹤（新增但還沒 add/commit）
    // - 工作目錄有未 commit 的修改
    // - git 錯誤、不是 git 倉庫等
    console.warn(
      `git diff 檢查異常，視為需要上傳: ${fullPath}`,
      err.message || err
    )

    return true // 安全起見，視為需要上傳
  }
}

async function collectFilesRecursively(
  dir: string,
  baseDir: string,
  prefix: string
): Promise<{ fullPath: string; key: string }[]> {
  const files: { fullPath: string; key: string }[] = []
  const entries = await fsPromises.readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    const relative = path.relative(baseDir, fullPath)
    const key = prefix ? path.posix.join(prefix, relative) : relative

    if (entry.isDirectory()) {
      // 遞迴子目錄
      const subFiles = await collectFilesRecursively(fullPath, baseDir, prefix)
      files.push(...subFiles)
    } else if (entry.isFile()) {
      files.push({ fullPath, key })
    }
  }

  return files
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
    filesToUpload.push(
      ...(await collectFilesRecursively(baseDir, baseDir, prefix))
    )
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
      const should = await shouldUpload(fullPath)

      if (!should) {
        console.log(`跳过 → ${key}`)
        skippedCount++
        continue
      }

      // 需要上传
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
;(async () => {
  await simpleUpload('./public/audios', '*', audioBucket, '', now)
})()
