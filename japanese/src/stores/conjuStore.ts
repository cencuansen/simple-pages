import { defineStore } from 'pinia'
import { ref } from 'vue'
import Papa from 'papaparse'

export interface Conju {
  dictionary: string // 辞书
  hiragana: string // 平假名
  meaning: string // 释义
  type: string // 类型
  transitivity: string // 及物性
  negative: string // 否定
  polite: string // 丁寧
  conditional: string // 条件
  volitional: string // 意向
  te: string // て
  past: string // 過去
  negativePast: string // 過去否定
  passive: string // 被动
  causative: string // 使役
  potential: string // 可能
  imperative: string // 命令
}

const jpJsonBase = import.meta.env.VITE_JSON_BASE

export const useConjuStore = defineStore('conju', () => {
  const conjuVerbs = ref<Conju[]>([])

  const fetchVerbConjus = async () => {
    const response = await fetch(`${jpJsonBase}/verbs_conju.csv`)
    const csvText = await response.text()
    Papa.parse<Conju>(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        conjuVerbs.value = result.data
      },
    })
  }

  return {
    conjuVerbs,
    fetchVerbConjus,
  }
})
