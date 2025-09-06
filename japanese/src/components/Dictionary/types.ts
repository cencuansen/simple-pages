import { type DictionaryName } from './index.ts'

export interface Dictionary {
  label: string
  name: string
  url: string
  logo?: string
  desc?: string
}

export interface DictionaryProps {
  word?: string
  dict?: DictionaryName
  disabled?: boolean
}
