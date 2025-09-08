import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { WordItem, FilterOptions } from '../types'
import Papa from 'papaparse'
import ky from 'ky'
import { v4 as uuidv4 } from 'uuid'

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
      const response = await ky(`${jpJsonBase}/words.csv`)
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
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Failed to fetch word data'
      console.error('Error fetching word:', err)
    } finally {
      isLoading.value = false
    }
  }

  const process = (data: WordItem[]) => {
    if (!data || data.length === 0) {
      return []
    }
    data.forEach((item: WordItem) => {
      item['textId'] = uuidv4()
    })
  }

  const getByLesson = (lesson: number) => {
    return wordList.value.filter((item) => item.lesson === lesson)
  }

  const searchByText = (text: string) => {
    if (!text) return wordList.value
    const searchText = text.toLowerCase()
    return wordList.value.filter((item) =>
      item.kana.toLowerCase().includes(searchText)
    )
  }

  const getByPos = (pos: string) => {
    return wordList.value.filter((item) => item.pos === pos)
  }

  const filterWord = (options: FilterOptions) => {
    let result = [...wordList.value]

    if (options.lesson) {
      result = result.filter((item) => item.lesson === options.lesson)
    }

    if (options.pos) {
      result = result.filter((item) => item.pos === options.pos)
    }

    if (options.searchText) {
      const text = options.searchText.toLowerCase()
      result = result.filter(
        (item) =>
          item.kana.toLowerCase().includes(text) ||
          (item.desc && item.desc.toLowerCase().includes(text))
      )
    }

    return result
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
    getByLesson,
    searchByText,
    getByPos,
    filterWord,
  }
})
