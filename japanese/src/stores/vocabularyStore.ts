/* src/modules/vocabulary/store/vocabulary.ts */
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
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
  const currentPage = ref(1)
  const pageSize = ref(20)
  const totalInView = ref(0)
  const keyword = ref('')
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

  // 过滤和分页数据
  const doFilter = computed(() => {
    const query = keyword.value.toLowerCase()
    let res = vocabularies.value
    if (query) {
      res = res.filter(
        (item) =>
          item.expression.toLowerCase().includes(query) ||
          item.reading.toLowerCase().includes(query) ||
          item.meaning.toLowerCase().includes(query) ||
          item.levels.includes(query)
      )
    }
    if (selectedLevels.value.length > 0) {
      const keys = selectedLevels.value.map((x) => x.toLowerCase())
      res = res.filter((item) =>
        item.levels.some((x) => keys.includes(x))
      )
    }

    totalInView.value = res.length
    return res
  })

  const selectedLevels = ref<string[]>([])

  const pageView = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return doFilter.value.slice(start, end)
  })

  const totalPages = computed(() =>
    Math.ceil(doFilter.value.length / pageSize.value)
  )

  // 更新分页
  function setPage(page: number) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  const levels = computed(() => {
    return [
      ...new Set(
        vocabularies.value.flatMap((item) => item.levels)
      ),
    ].sort()
  })

  // 更新搜索关键词
  function setKeyword(query: string) {
    keyword.value = query
    currentPage.value = 1 // 重置到第一页
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
    currentPage,
    pageSize,
    keyword,
    doFilter,
    pageView,
    totalInView,
    levels,
    selectedLevels,
    loadVocabularies,
    setPage,
    setKeyword,
  }
})
