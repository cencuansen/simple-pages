import type { WordItem } from '../../types'

export interface TextBase {
  content: string
  time: string
  translation?: string
}

export interface Conversation {
  speaker?: string
  content: string
  base?: string
  display?: string
  time: string
  translation?: string
}

export interface Discussion {
  title: string
  time: string
  contents: Conversation[][]
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
  conversations: Conversation[][]
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
