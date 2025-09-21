import fs from 'fs'
import Papa from 'papaparse'

interface WordItem {
  textId: string
  kana: string
  pos: string
  desc: string
  word: string
  lesson: number
  idx: number
  group: number
  tags: string
  levels: string[]
  ttsAudio?: string
  audio?: string
}

const csvText = fs.readFileSync('./words.csv').toString()
const wordList = []

Papa.parse<WordItem>(csvText, {
  header: true,
  skipEmptyLines: true,
  dynamicTyping: true,
  complete: (result) => {
    const data = result.data
    wordList.push(...data)
  },
  error: (err: any) => {
    console.log(`Error: ${err}`)
  },
})

const verbs1 = wordList
  .filter((d) => d.pos.includes('动') && d.lesson > 200)
  .map((d, i) => {
    d.idx = i + 1
    return d
  })

const json = verbs1.map(v => {
  return {
    word: v.word,
    kana: v.kana,
    lesson: v.lesson,
  }
})

fs.writeFileSync('./result-words.json', JSON.stringify(json, null, 2))

// const pageSize = 10
// const totalPages = Math.ceil(verbs1.length / pageSize)
// for (let page = 1; page <= totalPages; page++) {
//   const startIndex = (page - 1) * pageSize
//   const endIndex = Math.min(startIndex + pageSize, verbs1.length)
//   const pageData = verbs1.slice(startIndex, endIndex)
//
//   // 生成文件名，包含序号
//   const fileName = `verbs-${page}.json`
//   const filePath = join(__dirname, fileName)
//
//   // 写入文件
//   fs.writeFileSync(filePath, JSON.stringify(pageData, null, 2))
//   console.log(`已保存: ${fileName} (包含 ${pageData.length} 个动词)`)
// }
