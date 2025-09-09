import { defineStore } from 'pinia'
import { ref } from 'vue'
import ky from 'ky'

export interface Grammar {
  idx: number
  lesson: number
  title: string
  displayTitle: string
  desc: string[]
  example: string
  level: string
}

export interface GrammarFilter {
  lesson: number
  keyword?: string
}

const jpJsonBase = import.meta.env.VITE_JSON_BASE

export const useGrammarStore = defineStore('grammar', () => {
  const grammars = ref<Grammar[]>([])

  const init = async () => {
    const response = await ky(`${jpJsonBase}/grammars.json`)
    grammars.value = await response.json()
  }

  const queryGrammars = (param: GrammarFilter) => {
    let res = grammars.value
    if (param.lesson) {
      res = res.filter((r) => r.lesson === param.lesson)
    }
    if (param.keyword) {
      res = res.filter((r) => r.desc.includes(param.keyword || ''))
    }
    return res
  }

  return {
    grammars,
    init,
    queryGrammars,
  }
})
