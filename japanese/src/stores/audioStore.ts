import { defineStore, storeToRefs } from 'pinia'
import { ref } from 'vue'
import { type ReadingItem, useReadingStore } from './readingStore'

const audioUrlBase = import.meta.env.VITE_AUDIO_BASE

export const useAudioStore = defineStore('audio', () => {
  const readingStore = useReadingStore()
  const { rate, volume, repeatTimes } = storeToRefs(readingStore)
  const { setIsReading, setNowTextId } = readingStore

  const audioRef = ref<HTMLAudioElement | undefined>()
  const currentTime = ref(0)
  const isPlaying = ref(false)
  const currentAudio = ref<string>('')

  const setAudioRef = (ref: HTMLAudioElement | undefined) => {
    audioRef.value = ref
  }

  const getSrc = (path: string): string => {
    let str = `${audioUrlBase}${path}`
    if (path.includes('t=')) return str
    return `${str}?t=${Date.now()}`
  }

  const updateStatus = (status: boolean) => {
    isPlaying.value = status
    setIsReading(status)
  }

  let currentPauseHandler: (() => void) | null = null

  // 播放单个音频
  const playAudio = async (item: ReadingItem) => {
    if (!audioRef.value || !item) return

    updateStatus(true)
    setNowTextId(item.id)
    currentAudio.value = item.text

    // 移除旧的监听器
    if (currentPauseHandler) {
      audioRef.value.removeEventListener('ended', currentPauseHandler)
    }

    let playCount = 0

    const playLoop = async () => {
      if (playCount >= repeatTimes.value) {
        updateStatus(false)
        return
      }

      audioRef.value!.playbackRate = rate.value
      audioRef.value!.volume = volume.value
      audioRef.value!.src = getSrc(item.text)

      try {
        await audioRef.value!.play()
        playCount++

        // 设置下一次播放的监听
        audioRef.value!.addEventListener(
          'ended',
          () => {
            if (playCount < repeatTimes.value) {
              playLoop()
            } else {
              updateStatus(false)
            }
          },
          { once: true }
        )
      } catch (error) {
        console.error('播放音频失败:', error)
        updateStatus(false)
      }
    }

    await playLoop()
  }

  // 播放音频列表
  const playAudioList = async (items: ReadingItem[]) => {
    if (!audioRef.value || items.length === 0) return

    let listRepeatCount = 0
    let currentIndex = 0

    const playNext = async () => {
      if (currentIndex >= items.length) {
        // 完成一轮列表播放
        currentIndex = 0
        listRepeatCount++

        if (listRepeatCount >= repeatTimes.value) {
          // 完成所有重复次数
          updateStatus(false)
          return
        }
      }

      const item = items[currentIndex]
      setNowTextId(item.id)
      currentAudio.value = item.text

      audioRef.value!.playbackRate = rate.value
      audioRef.value!.volume = volume.value
      audioRef.value!.src = getSrc(item.text)

      try {
        await audioRef.value!.play()
        updateStatus(true)

        audioRef.value!.addEventListener(
          'ended',
          () => {
            currentIndex++
            playNext()
          },
          { once: true }
        )
      } catch (error) {
        console.error('播放音频失败:', error)
        updateStatus(false)
      }
    }

    await playNext()
  }

  const pauseAudio = () => {
    if (isPlaying.value && audioRef.value) {
      audioRef.value.pause()
      updateStatus(false)
    }
  }

  const onTimeUpdate = (e: Event) => {
    currentTime.value = (e.target as HTMLAudioElement)?.currentTime || 0
  }

  const onPlay = () => {}

  const onPause = () => {}

  const onError = () => {}

  const onAbort = () => {}

  return {
    audioRef,
    currentTime,
    isPlaying,
    currentAudio,

    setAudioRef,
    playAudio,
    playAudioList,
    pauseAudio,

    onTimeUpdate,
    onPlay,
    onPause,
    onError,
    onAbort,
  }
})
