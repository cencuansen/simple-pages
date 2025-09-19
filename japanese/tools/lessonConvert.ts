import fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve, join } from 'path'
import { newTextId } from '../src/utils/common'
import { speakText } from '../src/utils/lesson'
// 获取当前文件的 __filename 和 __dirname 等效值
// const __filename = fileURLToPath(import.meta.url)
// const __dirname = dirname(__filename)

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

// const file1 = join(__dirname, '../public/jsons/lesson.jsons')
const file1 = './lesson.json'
const data1: Lesson[] = JSON.parse(fs.readFileSync(file1).toString())
const allIds: string[] = []
data1.forEach((lesson: Lesson) => {
  lesson.sentences &&
    lesson.sentences.forEach((item: TextBase) => {
      if (lesson.index > 204) {
        const id = newTextId()
        item.textId = id
        item.ttsAudio = `/${lesson.index}/${id}.mp3`
        item.speakText = speakText(item.content)
      }
    })
  lesson.conversations &&
    lesson.conversations.forEach((items: TextBase[]) => {
      items.forEach((item: TextBase) => {
        if (lesson.index > 204) {
          const id = newTextId()
          item.textId = id
          item.ttsAudio = `/${lesson.index}/${id}.mp3`
          item.speakText = speakText(item.content)
        }
      })
    })
  lesson.discussions.contents &&
    lesson.discussions.contents.forEach((items: TextBase[]) => {
      items.forEach((item: TextBase) => {
        if (lesson.index > 204) {
          const id = newTextId()
          item.textId = id
          item.ttsAudio = `/${lesson.index}/${id}.mp3`
          item.speakText = speakText(item.content)
        }
      })
    })
  lesson.article.contents &&
    lesson.article.contents.forEach((item: TextBase) => {
      if (lesson.index > 204) {
        const id = newTextId()
        item.textId = id
        item.ttsAudio = `/${lesson.index}/${id}.mp3`
        item.speakText = speakText(item.content)
      }
    })
})
fs.writeFileSync('./lesson-new.json', JSON.stringify(data1, null, 2))
// fs.writeFileSync('./lesson-tts-source.json', JSON.stringify(ttsSource, null, 2))
