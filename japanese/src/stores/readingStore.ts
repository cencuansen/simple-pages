import { defineStore } from 'pinia'
import { ref } from 'vue'

// audio playing + tts speeching = reading
export const useReadingStore = defineStore('reading', () => {
  const isReading = ref(false)

  const rate = ref<number>(1) // 语速 (0.1-10)
  const pitch = ref<number>(1) // 音高 (0-2)
  const volume = ref<number>(1) // 音量 (0-1)
  const repeatTimes = ref<number>(1) // 重复次数 (1-5)

  const setIsReading = (value: boolean): void => {
    isReading.value = value
  }

  const play = () => {}
  const pause = () => {}

  return {
    rate,
    pitch,
    volume,
    repeatTimes,

    isReading,

    setIsReading,

    play,
    pause,
  }
})
