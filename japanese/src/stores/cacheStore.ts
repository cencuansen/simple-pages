// stores/cacheStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCacheStore = defineStore(
  'cache',
  () => {
    const maxCount = 5
    // 每个业务 cacheId 对应一个历史数组
    const caches = ref<Record<string, string[]>>({})

    // 获取历史
    const getHistory = (cacheId: string) => {
      return caches.value[cacheId] || []
    }

    // 添加历史（惰性记录，只在 change 时调用）
    const addHistory = (cacheId: string, keyword: string) => {
      if (!keyword) return
      const list = caches.value[cacheId] || []
      // 去重
      const filtered = list.filter((item) => item !== keyword)
      // 最新在前
      filtered.unshift(keyword)
      // 最多 10 条
      caches.value[cacheId] = filtered.slice(0, maxCount)
    }

    // 删除单条历史
    const deleteHistory = (cacheId: string, index: number) => {
      const list = caches.value[cacheId] || []
      list.splice(index, 1)
      caches.value[cacheId] = list
    }

    // 清空某个 cacheId 的历史
    const clearHistory = (cacheId: string) => {
      caches.value[cacheId] = []
    }

    return {
      caches,
      getHistory,
      addHistory,
      deleteHistory,
      clearHistory,
    }
  },
  {
    persist: true,
  }
)
