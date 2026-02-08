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
  origin: string
}

interface Conju {
  [key: string]: any // 添加索引签名
  textId: string // 唯一ID
  dictionary: string // 辞书
  hiragana: string // 平假名
  meaning: string // 释义
  type: string // 类型
  transitivity: string // 及物性
  negative: string // 否定
  polite: string // 丁寧
  conditional: string // 条件
  volitional: string // 意向
  te: string // て
  past: string // 過去
  negativePast: string // 過去否定
  passive: string // 被动
  causative: string // 使役
  potential: string // 可能
  imperative: string // 命令
  lesson: number // 课程号
}

const wordContent = fs.readFileSync('./words.csv').toString()
const conjuContent = fs.readFileSync('./verbs-conju.csv').toString()

let wordItems: WordItem[] = []
let conjuItems: Conju[] = []

Papa.parse<WordItem>(wordContent, {
  header: true,
  skipEmptyLines: true,
  dynamicTyping: true,
  complete: (result) => {
    wordItems = result.data
  },
  error: (err: any) => {
    console.log(`Error: ${err}`)
  },
})

Papa.parse<Conju>(conjuContent, {
  header: true,
  skipEmptyLines: true,
  dynamicTyping: true,
  complete: (result) => {
    conjuItems = result.data
  },
  error: (err: any) => {
    console.log(`Error: ${err}`)
  },
})

const result = []
result.push('textId,word,origin,kana,pos,desc,group,lesson')

for (let wordItem of wordItems) {
  let matched = false
  if (wordItem.pos.includes('动')) {
    for (let conjuItem of conjuItems) {
      if (conjuItem.dictionary === wordItem.word) {
        wordItem.origin = ''
        matched = true
        break // 找到匹配后跳出内层循环
      }
    }

    if (!matched) {
      for (let conjuItem of conjuItems) {
        const conjugationForms = [
          'te',
          'past',
          'negative',
          'negativePast',
          'polite',
          'potential',
          'passive',
          'causative',
          'causativePassive',
          'conditional',
          'imperative',
          'volitional',
          'prohibitive',
        ]

        for (const form of conjugationForms) {
          if (conjuItem[form] === wordItem.word) {
            wordItem.origin = conjuItem.dictionary
            break // 找到匹配后跳出内层循环
          }
        }
      }
    }
  }
  result.push(
    `${wordItem.textId},${wordItem.word},${wordItem.origin || ''},${wordItem.kana},${wordItem.pos},${wordItem.desc},${wordItem.group},${wordItem.lesson},`
  )
}
// textId,word,origin,kana,pos,desc,group,lesson
fs.writeFileSync(`./new-words.csv`, result.join('\n'))
