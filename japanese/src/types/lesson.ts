import type { WordItem } from '@/types/word.ts'

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

export interface RubyPart {
  text: string
  kana: string
  position: number
  length: number
}

export interface ParseRuby {
  rubyParts: RubyPart[]
  outputHtml: string
}

export interface OriginalTextParsedMap {
  [key: string]: any

  sourceText: string
  onlyKatakana: string
  katakanaFalseWordFalse: string
  katakanaFalseWordTrue: string
  katakanaTrueWordFalse: string
  katakanaTrueWordTrue: string
}

export interface OriginalTextMap {
  [key: string]: OriginalTextParsedMap
}

export interface ConvertParam {
  originalText: string
  words?: WordItem[]
}

export interface LessonSearch {
  idx: string
  title: string
  contents: LessonSearchContent[]
}

export interface LessonSearchContent {
  textId: string
  text: string
}
