import fs from 'fs'
import Papa from 'papaparse'

interface WordItem {
  textId: string
  word: string
  kana: string
  pos: string
  desc: string
  group: number
  lesson: number
}

const csvText = fs.readFileSync('./words.csv').toString()

Papa.parse<WordItem>(csvText, {
  header: true,
  skipEmptyLines: true,
  dynamicTyping: true,
  complete: (result) => {
    result.data.forEach((item) => {
      if (
        item.pos.includes('动') &&
        item.kana.endsWith('する') &&
        !item.word.endsWith('する')
      ) {
        // 修改
        item.word = `${item.word}する`
      }
    })

    // 写回原文件
    const modifiedCsv = Papa.unparse(result.data, {
      header: true,
      skipEmptyLines: true,
    })
    fs.writeFileSync('./words.csv', modifiedCsv)
  },
  error: (err: any) => {
    console.log(`Error: ${err}`)
  },
})
