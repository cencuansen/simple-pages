import fs from 'fs'
import Papa from 'papaparse'

const lessonsLite = JSON.parse(fs.readFileSync('./lesson-lite.json').toString())
const idIndexMap = new Map<string, number>()
for (const lesson of lessonsLite) {
  let index = lesson.index
  let ids = []
  lesson.sentences.forEach((s) => ids.push(s.textId))
  lesson.conversations.flatMap((c) => c).forEach((s) => ids.push(s.textId))
  lesson.discussions.contents
    .flatMap((c) => c)
    .forEach((s) => ids.push(s.textId))
  lesson.article.contents.flatMap((c) => c).forEach((s) => ids.push(s.textId))
  // console.log('---------------------')
  // console.log(`index = ${index}`);
  // ids.forEach(id => console.log(id));
  ids.forEach((id) => idIndexMap.set(id, index))
}

// ---

export interface Lesson {
  textId: string
  index: number
  content: string
}

const csvText = fs.readFileSync('./lesson-contents.csv').toString()
let lessonsContent: Lesson[] = []
Papa.parse<Lesson>(csvText, {
  header: true,
  skipEmptyLines: true,
  dynamicTyping: true,
  complete: (result) => {
    lessonsContent = result.data
  },
  error: (err: any) => {
    console.log(`Error: ${err}`)
  },
})
let result = []
result.push('textId,index,content')
lessonsContent.forEach((lesson) => {
  result.push(
    `${lesson.textId},${idIndexMap.get(lesson.textId)},${lesson.content}`
  )
})

fs.writeFileSync('./new-lesson-contents.csv', result.join('\n'))
