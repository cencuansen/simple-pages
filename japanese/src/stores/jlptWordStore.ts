import { defineStore } from 'pinia'
import { ref } from 'vue'
import Papa from 'papaparse'
import ky from 'ky'
import { newTextId } from '@/utils'
import type { WordItem } from '@/types'

const jpJsonBase = import.meta.env.VITE_JSON_BASE

export const useJlptWordStore = defineStore('jlpt-word', () => {
  const vocabularies = ref<WordItem[]>([])
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
      const response = await ky(`${jpJsonBase}/jlpt-vocabularies.csv?t=${Date.now()}`)
      const csvText = await response.text()
      Papa.parse<WordItem>(csvText, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
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

  function process(voc: WordItem[]): WordItem[] {
    voc.forEach((item) => {
      item.levels = item.tags
        .split(tagDelimiter)
        .map((x) => x.toLowerCase())
        .sort((a, b) => a.length - b.length)
      item.textId = newTextId()
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
