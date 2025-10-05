import fs from 'fs'
import Papa from 'papaparse'
import * as sqlite from 'node:sqlite'
import type { SQLOutputValue } from 'node:sqlite'

interface WordItem {
  ID: any
  Language_ID: any
  Parameter_ID: any
  Form: any
  Segments: any
  Comment: any
  Source: any
  Contribution_ID: any
  Word_ID: any
  BorrowedScore: any
  AgeScore: any
  SimplicityScore: any
  Borrowed: any
  Analyzability: any
  Age: any
  ContactSituation: any
  age_label: any
  borrowed_base: any
  calqued: any
  colonial_word: any
  comment_on_borrowed: any
  comment_on_word_form: any
  effect: any
  etymological_note: any
  gloss: any
  grammatical_info: any
  integration: any
  lexical_stratum: any
  loan_history: any
  numeric_frequency: any
  original_script: any
  other_comments: any
  reference: any
  register: any
  relative_frequency: any
  salience: any
  word_source: any
}

// 打开数据库连接
const db = new sqlite.DatabaseSync('D:/sqlite/loanword.db')
const query = db.prepare(`
select distinct * from 
(
select g.japanese as kata, g.gloss as source from gairaigo g
union all
select w."final" as kata, w.title as source from wiktionary w
);
`)
interface QueryResult {
  kata: string
  source: string
}
const all: Record<string, SQLOutputValue>[] = query.all()
const map = new Map<string, string>()
all.forEach((item) => {
  const kata = item['kata'] as string
  const source = item['source'] as string
  if (!map.has(kata)) {
    map.set(kata, source)
  }
})

interface WordItem {
  textId: string
  kana: string
  pos: string
  desc: string
  word: string
  lesson: number
  group: number
}

const csvText = fs.readFileSync('./words.csv').toString()

Papa.parse<WordItem>(csvText, {
  header: true,
  skipEmptyLines: true,
  dynamicTyping: true,
  complete: (result) => {
    result.data.forEach((item) => {
      if (item.lesson > 208) {
        if (/^[\u30A0-\u30FF]+$/.test(item.word) && map.has(item.word)) {
          item.desc = `${item.desc}(${map.get(item.word)})`
        }
      }
    })

    // 将修改后的数据转换回CSV格式
    const modifiedCsv = Papa.unparse(result.data, {
      header: true,
      skipEmptyLines: true,
    })

    // 写回原文件
    fs.writeFileSync('./words.csv', modifiedCsv)
  },
  error: (err: any) => {
    console.log(`Error: ${err}`)
  },
})
