import fs from 'fs'
import Papa from 'papaparse'

export interface Lesson {
  textId: string
  index: number
  content: string
}

const csvText = fs.readFileSync('./lessons.csv').toString()
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

let indexArr = [...new Set(contents.map((c) => c.index))].sort()
for (let index of indexArr) {
  const parts = contents.filter((c) => c.index === index)
  const result = []
  result.push('textId,index,content')
  parts.forEach((lesson) =>
    result.push(`${lesson.textId},${lesson.index},${lesson.content}`)
  )
  fs.writeFileSync(`./lessons/${index}.csv`, result.join('\n'))
}
