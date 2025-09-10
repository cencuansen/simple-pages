import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface ReadingItem {
  id: string
  text: string
}

// audio playing + tts speeching = reading
export const useReadingStore = defineStore('reading', () => {
  const isReading = ref(false)
  const nowTextId = ref('')
  const rate = ref<number>(1) // 语速 (0.1-10)
  const pitch = ref<number>(1) // 音高 (0-2)
  const volume = ref<number>(1) // 音量 (0-1)
  const repeatTimes = ref<number>(1) // 重复次数 (1-5)

  const setIsReading = (value: boolean): void => {
    isReading.value = value
  }

  const setNowTextId = (value: string): boolean => {
    nowTextId.value = value
    return true
  }

  const activeText = (id: string): boolean => {
    return nowTextId.value === id
  }

  // 检测浏览器功能兼容性
  const isTTSAvailable = computed(() => {
    return 'speechSynthesis' in window
  })

  const isAudioAvailable = computed(() => {
    return 'HTMLAudioElement' in window
  })

  return {
    rate,
    pitch,
    volume,
    repeatTimes,
    nowTextId,
    isReading,
    isTTSAvailable,
    isAudioAvailable,

    setIsReading,
    setNowTextId,
    activeText,
  }
})
