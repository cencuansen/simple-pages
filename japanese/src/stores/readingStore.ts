import { defineStore, storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useAudioStore } from './audioStore.ts'
import { useSpeechStore } from './speechStore.ts'

const speechStore = useSpeechStore()
const { isSpeaking } = storeToRefs(speechStore)

const audioStore = useAudioStore()
const { isPlaying } = storeToRefs(audioStore)

// audio playing + tts speeching = reading
export const useReadingStore = defineStore('reading', () => {
  const rate = ref<number>(1) // 语速 (0.1-10)
  const pitch = ref<number>(1) // 音高 (0-2)
  const volume = ref<number>(1) // 音量 (0-1)
  const repeatTimes = ref<number>(1) // 重复次数 (1-5)

  const isReading = computed(() => {
    return isSpeaking || isPlaying
  })

  const play = () => {}
  const pause = () => {}

  return {
    rate,
    pitch,
    volume,
    repeatTimes,

    isReading,

    play,
    pause,
  }
})
