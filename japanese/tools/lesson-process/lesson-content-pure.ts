import fs from 'fs'
import Papa from 'papaparse'

export interface Lesson {
  textId: string
  index: number
  content: string
}

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

const csvText = fs.readFileSync('./lesson-contents.csv').toString()
let contents: Lesson[] = []
Papa.parse<Lesson>(csvText, {
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

const result = []
result.push('textId,index,content')
for (let content of contents) {
  result.push(`${content.textId},${content.index},${extractPlainText(content.content)}`)
}
fs.writeFileSync(`./lesson-content-pure.csv`, result.join('\n'))
