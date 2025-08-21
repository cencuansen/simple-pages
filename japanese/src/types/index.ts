export interface WordItem {
  kana: string
  kanji: string
  pos: string
  desc: string
  word: string
  lesson: number
  idx: number
}

export interface FilterOptions {
  lesson?: number
  pos?: string
  searchText?: string
}

export interface VoiceOption {
  name: string
  lang: string
  voice: SpeechSynthesisVoice
}
