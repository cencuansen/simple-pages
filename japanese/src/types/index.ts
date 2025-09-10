export interface WordItem {
  textId: string
  kana: string
  pos: string
  desc: string
  word: string
  lesson: number
  idx: number
  group: number
  tags: string
  levels: string[]
  ttsAudio?: string
  audio?: string
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
