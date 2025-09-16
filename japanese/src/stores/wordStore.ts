import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { WordFilter, WordItem } from '@/types'
import Papa from 'papaparse'
import ky from 'ky'
import { newTextId } from '@/utils'

const jpJsonBase = import.meta.env.VITE_JSON_BASE

export const useWordStore = defineStore('word', () => {
  // State
  const wordList = ref<WordItem[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const isInitialized = ref(false)

  // Getters
  const uniqueLessons = computed(() => {
    const lessons = new Set<number>()
    wordList.value.forEach((item) => lessons.add(item.lesson))
    return Array.from(lessons).sort()
  })

  const lessonCount = computed(() => {
    const lessons = new Set<number>()
    wordList.value.forEach((item) => lessons.add(item.lesson))
    return lessons.size
  })

  // Actions
  const init = async () => {
    try {
      isLoading.value = true
      error.value = null
      const response = await ky(`${jpJsonBase}/words.csv?t=${Date.now()}`)
      const csvText = await response.text()
      Papa.parse<WordItem>(csvText, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (result) => {
          const data = result.data
          process(data)
          wordList.value = data
          isInitialized.value = true
        },
        error: (err: any) => {
          error.value = err.message
        },
      })
    } catch (_) {
    } finally {
      isLoading.value = false
    }
  }

  const process = (data: WordItem[]) => {
    if (!data || data.length === 0) {
      return []
    }
    data.forEach((item: WordItem) => {
      item['textId'] = newTextId()
    })
  }

  const queryWords = (filter: WordFilter): WordItem[] => {
    return wordList.value.filter((item) => {
      const matchesLesson = filter.lesson ? item.lesson === filter.lesson : true
      const matchesKeyword = filter.keyword
        ? item.kana.includes(filter.keyword) ||
          item.desc.includes(filter.keyword)
        : true
      const matchesTextId = filter.textIds
        ? filter.textIds.includes(item.textId)
        : true
      return matchesLesson && matchesKeyword && matchesTextId
    })
  }

  return {
    // State
    wordList,
    lessonCount,
    isLoading,
    error,
    isInitialized,

    // Getters
    uniqueLessons,

    // Actions
    init,
    queryWords,
  }
})
