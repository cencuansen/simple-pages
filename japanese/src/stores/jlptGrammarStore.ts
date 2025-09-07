import { defineStore } from 'pinia'
import { ref } from 'vue'
import ky from 'ky'

export interface JlptGrammar {
  grammar: string
  meaning: string
  example: string
  level: string
}

export interface JlptGrammarFilter {
  keyword?: string
  level?: string
}

const jpJsonBase = import.meta.env.VITE_JSON_BASE

export const useJlptGrammarStore = defineStore('jlpt-grammar', () => {
  const JlptGrammars = ref<JlptGrammar[]>([])

  const fetchJlptGrammars = async () => {
    const response = await ky(`${jpJsonBase}/jlpt-grammars-en.json`)
    JlptGrammars.value = await response.json()
  }

  const queryJlptGrammars = (param: JlptGrammarFilter) => {
    let res = JlptGrammars.value
    if (param.level) {
      res = res.filter((r) => r.level === param.level)
    }
    if (param.keyword) {
      res = res.filter(
        (r) =>
          r.grammar.includes(param.keyword || '') ||
          r.meaning.includes(param.keyword || '') ||
          r.example.includes(param.keyword || '')
      )
    }
    return res
  }

  return {
    JlptGrammars,
    fetchJlptGrammars,
    queryJlptGrammars,
  }
})
