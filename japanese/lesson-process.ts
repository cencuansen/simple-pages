import fs from 'fs'
import Papa from 'papaparse'

export interface Lesson {
  textId: string
  index: number
  content: string
}

const lessonPathFrom: string = './public/jsons/lesson-contents.csv'
const translationPathFrom: string = './public/jsons/lesson-translations.csv'

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
