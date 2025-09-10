import fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve, join } from 'path'
import { newTextId, speakText } from '../src/utils'
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
const ttsSource: TtsSource[] = []
data1.forEach((lesson: Lesson) => {
  lesson.sentences &&
    lesson.sentences.forEach((item: TextBase) => {
      // item['textId'] = newTextId()
      item['ttsAudio'] = `/${item['textId']}.mp3`
      // item['speakText'] = speakText(item.content)
      if (item.time) {
        item['audio'] = `/${lesson.index}.mp3#t=${item.time}`
      }
      ttsSource.push({
        lesson: lesson.index,
        module: 'sentences',
        textId: item.textId,
        speakText: item.speakText,
      })
    })
  lesson.conversations &&
    lesson.conversations.forEach((items: TextBase[]) => {
      items.forEach((item: TextBase) => {
        // item['textId'] = newTextId()
        item['ttsAudio'] = `/${item['textId']}.mp3`
        // item['speakText'] = speakText(item.content)
        if (item.time) {
          item['audio'] = `/${lesson.index}.mp3#t=${item.time}`
        }
        ttsSource.push({
          lesson: lesson.index,
          module: 'conversations',
          textId: item.textId,
          speakText: item.speakText,
        })
      })
    })
  lesson.discussions.contents &&
    lesson.discussions.contents.forEach((items: TextBase[]) => {
      items.forEach((item: TextBase) => {
        // item['textId'] = newTextId()
        item['ttsAudio'] = `/${item['textId']}.mp3`
        // item['speakText'] = speakText(item.content)
        if (item.time) {
          item['audio'] = `/${lesson.index}.mp3#t=${item.time}`
        }
        ttsSource.push({
          lesson: lesson.index,
          module: 'discussions',
          textId: item.textId,
          speakText: item.speakText,
        })
      })
    })
  lesson.article.contents &&
    lesson.article.contents.forEach((item: TextBase) => {
      // item['textId'] = newTextId()
      item['ttsAudio'] = `/${item['textId']}.mp3`
      // item['speakText'] = speakText(item.content)
      if (item.time) {
        item['audio'] = `/${lesson.index}.mp3#t=${item.time}`
      }
      ttsSource.push({
        lesson: lesson.index,
        module: 'article',
        textId: item.textId,
        speakText: item.speakText,
      })
    })
})
fs.writeFileSync('./lesson-new.json', JSON.stringify(data1, null, 2))
// fs.writeFileSync('./lesson-tts-source.json', JSON.stringify(ttsSource, null, 2))
