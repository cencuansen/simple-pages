import { type DictionaryName } from './constants.ts'

export interface Dictionary {
  label: string
  name: string
  url: string
  logo?: string
  desc?: string
}

export interface DictionarySelector {
  word?: string
  dictName?: DictionaryName
  disabled?: boolean
}

export interface DictionaryCore {
  word: string
  dict: Dictionary
  disabled?: boolean
}
