import fs from 'fs'
import fsPromises from 'fs/promises'
import path from 'path'
import Papa from 'papaparse'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

export interface Lesson {
  textId: string
  index: number
  content: string
}

// ====================== 這裡放你自己的 R2 / S3 設定 ======================
const s3Client = new S3Client({
  region: 'auto',
  endpoint: 'https://你的account-id.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: '你的 access key id',
    secretAccessKey: '你的 secret access key',
  },
  forcePathStyle: true,
})
// ==========================================================================

/**
 * 把檔案或整個資料夾的檔案上傳到 R2
 * filename === '*' → 上傳整個資料夾
 * filename 是檔名 → 只上傳單一檔案
 * 只上傳 since 之後有修改過的檔案
 */
async function simpleUpload(
  sourceBaseDir: string,
  sourceFilename: string,
  bucket: string,
  keyPrefix: string,
  since: Date
) {
  const isBulk = sourceFilename === '*'

  // 處理 key 的前綴
  let prefix = keyPrefix.trim()
  if (prefix && !prefix.endsWith('/')) {
    prefix += '/'
  }

  const baseDir = path.resolve(sourceBaseDir)

  const filesToUpload: { fullPath: string; key: string }[] = []

  if (isBulk) {
    // 全部檔案
    const entries = await fsPromises.readdir(baseDir, { withFileTypes: true })

    for (const entry of entries) {
      if (!entry.isFile()) continue

      const fullPath = path.join(baseDir, entry.name)
      const stat = await fsPromises.stat(fullPath)

      // 只上傳修改時間 >= since 的檔案
      if (stat.mtime < since) continue

      const key = prefix + entry.name
      filesToUpload.push({ fullPath, key })
    }
  } else {
    // 單一檔案
    const fullPath = path.join(baseDir, sourceFilename)

    let stat: fs.Stats
    try {
      stat = await fsPromises.stat(fullPath)
    } catch {
      console.log(`找不到檔案，跳過 → ${fullPath}`)
      return
    }

    if (stat.mtime < since) {
      console.log(`檔案沒有更新，跳過 → ${sourceFilename}`)
      return
    }

    const key = prefix + sourceFilename
    filesToUpload.push({ fullPath, key })
  }

  if (filesToUpload.length === 0) {
    console.log('沒有任何檔案需要上傳')
    return
  }

  console.log(`\n準備上傳 ${filesToUpload.length} 個檔案 到 ${bucket}`)

  for (const { fullPath, key } of filesToUpload) {
    try {
      const content = await fsPromises.readFile(fullPath)

      // 簡單判斷 content-type（可再自行擴充）
      let contentType = 'application/octet-stream'
      const ext = path.extname(fullPath).toLowerCase()

      if (ext === '.csv') contentType = 'text/csv; charset=utf-8'
      else if (ext === '.json') contentType = 'application/json; charset=utf-8'
      else if (ext === '.txt') contentType = 'text/plain; charset=utf-8'

      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: content,
        ContentType: contentType,
        // 如果想要公開讀取，可以加上這一行（看你需求）
        // ACL: 'public-read',
      })

      await s3Client.send(command)

      console.log(`上傳成功 → ${key}`)
    } catch (e) {
      console.error(`上傳失敗 → ${key}`)
      console.error(e)
    }
  }
}

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
  const result = []
  result.push('textId,index,content')
  parts.forEach((lesson) =>
    result.push(`${lesson.textId},${lesson.index},${lesson.content}`)
  )
  fs.writeFileSync(`./public/lessons/${index}.csv`, result.join('\n'))
}

// 上传 lessons 資料夾全部 csv
;(async () => {
  await simpleUpload('./public/lessons', '*', jsonBucket, 'lessons', now)
})()
// ----

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
  const result = []
  result.push('textId,index,content')
  parts.forEach((lesson) => {
    result.push(`${lesson.textId},${lesson.index},${lesson.content}`)
  })
  fs.writeFileSync(`./public/translations/${index}.csv`, result.join('\n'))
}

// 上传 translations 資料夾全部 csv
;(async () => {
  await simpleUpload(
    './public/translations',
    '*',
    jsonBucket,
    'translations',
    now
  )
})()

// ----

/**
 * 提取标记文本中的纯文本
 * @param input 原始标记字符串
 * @returns 提取后的纯文本
 */
function extractPlainText(input: string): string {
  return (
    input
      // 去掉带锚点的方括号，只保留中间内容
      .replace(/\[([^\]]*?)‖[^\]]*?\]/g, '$1')
      // 将所有 {surface|reading} → surface
      .replace(/\{([^|}]+)\|[^}]+\}/g, '$1')
      .replace(/\s+/g, '')
  )
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

const result = []
result.push('textId,index,content')
for (let content of pureContents) {
  result.push(
    `${content.textId},${content.index},${extractPlainText(content.content)}`
  )
}
fs.writeFileSync(`./public/jsons/lesson-content-pure.csv`, result.join('\n'))

// 上传 lesson-content-pure.csv 單一檔案
;(async () => {
  await simpleUpload(
    './public/jsons',
    'lesson-content-pure.csv',
    jsonBucket,
    '', // 放在 bucket 根目錄
    now
  )
})()
