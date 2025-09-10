import { defineStore, storeToRefs } from 'pinia'
import { ref, watch } from 'vue'
import { useReadingStore } from './readingStore.ts'
import { useSpeechStore } from './speechStore.ts'

const audioUrlBase = import.meta.env.VITE_AUDIO_BASE

export const useAudioStore = defineStore('audio', () => {
  const readingStore = useReadingStore()
  const { rate, volume, isReading, repeatTimes } = storeToRefs(readingStore)
  const setIsReading = readingStore.setIsReading
  const setNowTextId = readingStore.setNowTextId

  const speechStore = useSpeechStore()
  const { isSpeaking } = storeToRefs(speechStore)

  const audioRef = ref<HTMLAudioElement | undefined>()
  const currentTime = ref(0)
  const isPlaying = ref(false)

  const getSrc = (path: string): string => {
    if (isSpeaking.value) {
      return ''
    }
    return `${audioUrlBase}${path}`
  }

  const setAudioRef = (ref: HTMLAudioElement | undefined) => {
    audioRef.value = ref
  }

  let currentPauseHandler: (() => void) | null = null

  const pauseHandler = async (url: string, playTimes: number) => {
    await doPlayAudio(url, playTimes - 1)
  }

  const playAudio = async (url: string = '') => {
    await doPlayAudio(url, repeatTimes.value)
  }

  const playAudios = async (urls: string[] = []) => {
    await doPlayAudio(urls[0], repeatTimes.value)
  }

  const doPlayAudio = async (path: string = '', playTimes: number = 1) => {
    const src = getSrc(path)
    if (!audioRef.value || !src || playTimes < 1) {
      return
    }
    setNowTextId('')

    // 移除旧的监听器
    if (currentPauseHandler) {
      audioRef.value?.removeEventListener('pause', currentPauseHandler)
    }
    // 创建并存储新的处理函数
    currentPauseHandler = () => pauseHandler(src, playTimes)
    audioRef.value?.addEventListener('pause', currentPauseHandler)

    audioRef.value.playbackRate = rate.value
    audioRef.value.volume = volume.value
    audioRef.value.src = src

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

  const onTimeUpdate = (e: any) => {
    currentTime.value = e.target?.currentTime || 0
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
    audioRef,
    currentTime,
    isPlaying,

    setAudioRef,

    playAudio,
    playAudios,
    pauseAudio,

    onTimeUpdate,
    onPlay,
    onPause,
    onError,
    onAbort,
  }
})
