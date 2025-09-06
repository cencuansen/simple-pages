import { type DictionaryName } from './index.ts'

export interface Dictionary {
  label: string
  name: string
  url: string
  logo?: string
  description?: string
}

export interface DictionaryProps {
  word?: string
  dict?: DictionaryName
}
