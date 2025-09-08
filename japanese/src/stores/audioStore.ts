import { defineStore, storeToRefs } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useLessonStore } from './lessonStore.ts'
import { useReadingStore } from './readingStore.ts'

const audioUrlBase = import.meta.env.VITE_AUDIO_BASE

export const useAudioStore = defineStore('audio', () => {
  const lessonStore = useLessonStore()
  const { lessonAudio } = storeToRefs(lessonStore)

  const readingStore = useReadingStore()
  const { rate, volume, isReading, repeatTimes } = storeToRefs(readingStore)
  const setIsReading = readingStore.setIsReading

  const audioRef = ref<HTMLAudioElement | undefined>()
  const currentTime = ref(0)
  const isPlaying = ref(false)

  const src = computed(() => {
    if (isReading.value) {
      return void 0
    }
    return `${audioUrlBase}${lessonAudio.value}`
  })

  const setAudioRef = (ref: HTMLAudioElement | undefined) => {
    audioRef.value = ref
  }

  let currentPauseHandler: (() => void) | null = null

  const pauseHandler = async (url: string, playTimes: number) => {
    await doPlayAudio(url, playTimes - 1)
  }

  const playAudio = async (timeRange: string = '') => {
    await doPlayAudio(timeRange, repeatTimes.value)
  }

  const doPlayAudio = async (timeRange: string = '', playTimes: number = 1) => {
    if (!audioRef.value || !src.value || playTimes < 1) {
      return
    }
    const url = `${src.value}${timeRange}`
    audioRef.value.src = url

    // 移除旧的监听器
    if (currentPauseHandler) {
      audioRef.value?.removeEventListener('pause', currentPauseHandler)
    }
    // 创建并存储新的处理函数
    currentPauseHandler = () => pauseHandler(url, playTimes)
    audioRef.value?.addEventListener('pause', currentPauseHandler)

    audioRef.value.playbackRate = rate.value
    audioRef.value.volume = volume.value

    await audioRef.value.play()
  }

  const pauseAudio = () => {
    if (isReading.value) {
      // 移除监听器
      if (currentPauseHandler) {
        audioRef.value?.removeEventListener('pause', currentPauseHandler)
        currentPauseHandler = null
      }
      audioRef.value?.pause()
    }
  }

  const onTimeUpdate = (something: any) => {
    console.log('onTimeUpdate', something)
    currentTime.value = audioRef.value?.currentTime || 0
  }
  const onPlay = () => {
    isPlaying.value = true
  }
  const onPause = () => {
    isPlaying.value = false
  }
  const onError = () => {
    isPlaying.value = false
  }
  const onAbort = () => {
    isPlaying.value = false
  }

  watch(
    () => isPlaying.value,
    () => {
      setIsReading(isPlaying.value)
    }
  )

  return {
    src,
    audioRef,
    currentTime,
    isPlaying,

    setAudioRef,

    playAudio,
    pauseAudio,

    onTimeUpdate,
    onPlay,
    onPause,
    onError,
    onAbort,
  }
})
