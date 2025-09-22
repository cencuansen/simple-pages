import { defineStore } from 'pinia'
import { ref } from 'vue'
import ky from 'ky'
import type { Grammar } from './grammarStore.ts'

export interface JlptGrammarFilter {
  keyword?: string
  level?: string
}

const jpJsonBase = import.meta.env.VITE_JSON_BASE

export const useJlptGrammarStore = defineStore('jlpt-grammar', () => {
  const jlptGrammars = ref<Grammar[]>([])

  const init = async () => {
    const response = await ky(`${jpJsonBase}/jlpt-grammars-en.json?t=${Date.now()}`)
    jlptGrammars.value = await response.json()
  }

  return {
    jlptGrammars,
    init,
  }
})
