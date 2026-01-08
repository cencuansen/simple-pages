import fs from 'fs'
import { dirname, resolve, join } from 'path'
import Papa from 'papaparse'
import { convertText } from './split-core'

import { v4 as uuidv4 } from 'uuid'

export const newTextId = () => `i_${uuidv4().split('-')[4]}`

interface TtsSource {
  lesson: number
  module: 'sentences' | 'conversations' | 'discussions' | 'article'
  textId: string
  speakText: string
}

export interface TextBase {
  textId: string
  speaker: string
  content: string
  speakText: string
  time: string
  translation?: string
  display?: string
  ttsAudio?: string
  audio?: string
}

export interface Discussion {
  title: string
  time: string
  contents: TextBase[][]
}

export interface Article {
  title: string
  time: string
  contents: TextBase[]
}

export interface Lesson {
  index: number
  title: string
  audio: string
  sentences: TextBase[]
  conversations: TextBase[][]
  discussions: Discussion
  article: Article
}

interface WordItem {
  textId: string
  kana: string
  pos: string
  desc: string
  word: string
  lesson: number
  idx: number | string
  group: number
  tags: string
  levels: string[]
  ttsAudio?: string
  audio?: string
}

function contentBase(text: string) {
  return text.replace(/[ 　]/g, '').replace(/!([^(]+)\(([^)]+)\)/g, '$1')
}

const csvText = fs.readFileSync('./words.csv').toString()
let wordList = []
Papa.parse<WordItem>(csvText, {
  header: true,
  skipEmptyLines: true,
  dynamicTyping: true,
  complete: (result) => {
    wordList = result.data
  },
  error: (err: any) => {
    console.log(`Error: ${err}`)
  },
})

const data1: Lesson[] = JSON.parse(fs.readFileSync('./lesson.json').toString())
const lessonContents = []
const lessonTranslations = []
data1.forEach((lesson: Lesson) => {
  const lessonWords = wordList.filter((w) => w.lesson === lesson.index)

  const lessonIndex = lesson.title.indexOf('課')
  if (lessonIndex < lesson.title.length) {
    lesson.title =
      lesson.title.slice(0, lessonIndex + 1) +
      ' ' +
      convertText(lesson.title.slice(lessonIndex + 1), lessonWords)
  }

  delete lesson.audio

  lesson.sentences &&
    lesson.sentences.forEach((item: TextBase) => {
      lessonContents.push(
        `${item.textId},${convertText(item.content, lessonWords)}`
      )
      lessonTranslations.push(`${item.textId},${item.translation}`)

      delete item.content
      delete item.speakText
      delete item.time
      delete item.translation
      delete item.display
      delete item.ttsAudio
      delete item.audio
    })
  lesson.conversations &&
    lesson.conversations.forEach((items: TextBase[]) => {
      items.forEach((item: TextBase) => {
        lessonContents.push(
          `${item.textId},${convertText(item.content, lessonWords)}`
        )
        lessonTranslations.push(`${item.textId},${item.translation}`)

        item.speaker = contentBase(item.speaker)

        delete item.content
        delete item.speakText
        delete item.time
        delete item.translation
        delete item.display
        delete item.ttsAudio
        delete item.audio
      })
    })

  lesson.discussions.title &&
    (lesson.discussions.title = convertText(
      lesson.discussions.title,
      lessonWords
    ))
  lesson.discussions.contents &&
    lesson.discussions.contents.forEach((items: TextBase[]) => {
      items.forEach((item: TextBase) => {
        lessonContents.push(
          `${item.textId},${convertText(item.content, lessonWords)}`
        )
        lessonTranslations.push(`${item.textId},${item.translation}`)

        item.speaker = contentBase(item.speaker)

        delete item.content
        delete item.speakText
        delete item.time
        delete item.translation
        delete item.display
        delete item.ttsAudio
        delete item.audio
      })
    })

  lesson.article.title &&
    (lesson.article.title = convertText(lesson.article.title, lessonWords))
  lesson.article.contents &&
    lesson.article.contents.forEach((item: TextBase) => {
      lessonContents.push(
        `${item.textId},${convertText(item.content, lessonWords)}`
      )
      lessonTranslations.push(`${item.textId},${item.translation}`)

      delete item.content
      delete item.speakText
      delete item.time
      delete item.translation
      delete item.display
      delete item.ttsAudio
      delete item.audio
    })
})

fs.writeFileSync('./lesson-lite.json', JSON.stringify(data1, null, 2))
fs.writeFileSync(
  './lesson-contents.csv',
  `textId,content\n${lessonContents.join('\n')}`
)
fs.writeFileSync(
  './lesson-translations.csv',
  `textId,content\n${lessonTranslations.join('\n')}`
)
