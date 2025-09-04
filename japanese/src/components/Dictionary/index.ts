export interface Dictionary {
  label: string
  name: string
  url: string
  logo?: string
  description?: string
}

export interface DictionaryProps {
  word: string
  dict?: 'Mazii' | 'JapanDict' | 'JiSho'
}
