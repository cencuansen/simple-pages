import fs from 'fs'
import { dirname, resolve, join } from 'path'
import Papa from 'papaparse'

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

function convertText(content: string, words: WordItem[]): string {
  content = content.replace(/[ 　]/g, '')

  // 正则表达式匹配 !汉字(假名) 格式
  const rubyRegex = /!([^(]+)\(([^)]+)\)/g

  // 存储所有匹配到的注音片段及其位置
  const rubyMatches: Array<{
    fullMatch: string
    kanji: string
    kana: string
    index: number
  }> = []

  let match
  while ((match = rubyRegex.exec(content)) !== null) {
    rubyMatches.push({
      fullMatch: match[0],
      kanji: match[1],
      kana: match[2],
      index: match.index,
    })
  }

  if (rubyMatches.length === 0) {
    return content // 如果没有注音，直接返回原文本
  }

  // 构建单词映射表，便于快速查找
  const wordMap = new Map<string, WordItem>()
  words.forEach((word) => {
    wordMap.set(word.word, word)
  })

  // 找出连续的注音片段可能组成的单词
  const wordGroups: Array<{
    startIndex: number
    endIndex: number
    combinedKanji: string
    combinedKana: string
    wordItem: WordItem | null
  }> = []

  // 遍历所有可能的连续组合
  for (let i = 0; i < rubyMatches.length; i++) {
    let combinedKanji = ''
    let combinedKana = ''

    for (let j = i; j < rubyMatches.length; j++) {
      // 检查是否连续（中间没有其他字符）
      if (j > i) {
        const prevEnd =
          rubyMatches[j - 1].index + rubyMatches[j - 1].fullMatch.length
        const currentStart = rubyMatches[j].index

        // 如果中间有其他字符，则不是连续组合
        if (prevEnd < currentStart) {
          break
        }
      }

      combinedKanji += rubyMatches[j].kanji
      combinedKana += rubyMatches[j].kana

      const wordItem = wordMap.get(combinedKanji)
      if (wordItem) {
        wordGroups.push({
          startIndex: rubyMatches[i].index,
          endIndex: rubyMatches[j].index + rubyMatches[j].fullMatch.length,
          combinedKanji,
          combinedKana,
          wordItem,
        })
      }
    }
  }

  // 按长度排序，优先匹配长的单词
  wordGroups.sort(
    (a, b) => b.endIndex - b.startIndex - (a.endIndex - a.startIndex)
  )

  // 标记已被使用的注音片段
  const usedIndices = new Set<number>()
  const processedGroups: typeof wordGroups = []

  // 选择不重叠的最长匹配
  for (const group of wordGroups) {
    let overlap = false
    for (let i = group.startIndex; i < group.endIndex; i++) {
      if (usedIndices.has(i)) {
        overlap = true
        break
      }
    }

    if (!overlap) {
      processedGroups.push(group)
      for (let i = group.startIndex; i < group.endIndex; i++) {
        usedIndices.add(i)
      }
    }
  }

  // 构建结果字符串
  let result = ''
  let lastIndex = 0
  let currentIndex = 0

  while (currentIndex < content.length) {
    // 检查当前位置是否在已处理的单词组中
    const matchingGroup = processedGroups.find(
      (group) =>
        group.startIndex <= currentIndex && currentIndex < group.endIndex
    )

    if (matchingGroup) {
      // 添加匹配组之前的内容
      result += content.slice(lastIndex, matchingGroup.startIndex)

      // 添加单词组
      const rubyParts: string[] = []
      let tempIndex = matchingGroup.startIndex

      while (tempIndex < matchingGroup.endIndex) {
        const rubyMatch = rubyMatches.find((m) => m.index === tempIndex)
        if (rubyMatch) {
          rubyParts.push(`{${rubyMatch.kanji}|${rubyMatch.kana}}`)
          tempIndex += rubyMatch.fullMatch.length
        } else {
          tempIndex++
        }
      }

      if (matchingGroup.wordItem) {
        result += `[${rubyParts.join('')}|${matchingGroup.wordItem.textId}]`
      } else {
        result += rubyParts.join('')
      }

      currentIndex = matchingGroup.endIndex
      lastIndex = currentIndex
    } else {
      // 检查当前位置是否有未处理的注音
      const rubyMatch = rubyMatches.find(
        (m) => m.index === currentIndex && !usedIndices.has(m.index)
      )

      if (rubyMatch) {
        result += content.slice(lastIndex, currentIndex)
        result += `{${rubyMatch.kanji}|${rubyMatch.kana}}`
        currentIndex += rubyMatch.fullMatch.length
        lastIndex = currentIndex
        usedIndices.add(rubyMatch.index)
      } else {
        currentIndex++
      }
    }
  }

  // 添加剩余内容
  if (lastIndex < content.length) {
    result += content.slice(lastIndex)
  }

  return result
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
fs.writeFileSync('./lesson-contents.csv', lessonContents.join('\n'))
fs.writeFileSync('./lesson-translations.csv', lessonTranslations.join('\n'))
