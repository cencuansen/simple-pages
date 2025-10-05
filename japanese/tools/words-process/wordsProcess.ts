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
const wordItems: WordItem[] = []

Papa.parse<WordItem>(csvText, {
  header: true,
  skipEmptyLines: true,
  dynamicTyping: true,
  complete: (result) => {
    result.data.forEach((item) => {
      if (item.lesson > 208) {
        if (/^[\u30A0-\u30FF]+$/.test(item.word)) {
          wordItems.push(item)
        }
      }
    })
  },
  error: (err: any) => {
    console.log(`Error: ${err}`)
  },
})

console.log('')
