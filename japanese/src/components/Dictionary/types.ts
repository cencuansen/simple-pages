import { type DictionaryName } from './index.ts'

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

export interface DictionaryCoreProps {
  word: string
  dict: Dictionary
  disabled?: boolean
}
