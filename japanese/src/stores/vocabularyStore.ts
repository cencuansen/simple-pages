/* src/modules/vocabulary/store/vocabulary.ts */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import Papa from 'papaparse'

export interface Vocabulary {
  expression: string
  reading: string
  meaning: string
  tags: string
  level: number
  levelName: string
  levels: string[]
}

const jpJsonBase = import.meta.env.VITE_JSON_BASE

export const useVocabularyStore = defineStore('vocabulary', () => {
  const vocabularies = ref<Vocabulary[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const tagDelimiter = /\s+/

  // 加载CSV数据
  async function loadVocabularies() {
    if (vocabularies.value.length > 0) {
      return
    }
    loading.value = true
    error.value = null
    try {
      const response = await fetch(`${jpJsonBase}/jlpt-vocabularies.csv`)
      const csvText = await response.text()
      Papa.parse<Vocabulary>(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          vocabularies.value = process(result.data)
        },
        error: (err: any) => {
          error.value = err.message
        },
      })
    } catch (err) {
      error.value = 'Failed to load CSV data'
    } finally {
      loading.value = false
    }
  }

  function process(voc: Vocabulary[]): Vocabulary[] {
    voc.forEach((item) => {
      item.levels = item.tags
        .split(tagDelimiter)
        .map((x) => x.toLowerCase())
        .sort((a, b) => a.length - b.length)
    })
    return voc
  }

  return {
    tagDelimiter,
    vocabularies,
    loading,
    error,
    loadVocabularies,
  }
})
