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

export interface ActiveWord {
  textId: string
  word: string
  lesson: number
}

export interface WordFilter {
  lesson?: number
  keyword?: string
  textIds?: string[]
}

export interface VoiceOption {
  name: string
  lang: string
  voice: SpeechSynthesisVoice
}
