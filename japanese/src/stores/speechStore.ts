import { defineStore, storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { type ReadingItem, useReadingStore } from './readingStore.ts'

export const useSpeechStore = defineStore(
  'speech',
  () => {
    const readingStore = useReadingStore()
    const { rate, volume, pitch, repeatTimes } = storeToRefs(readingStore)
    const { setIsReading, setNowTextId } = readingStore

    // 可配置项
    const lang = ref<string>('ja-JP') // 语言
    const voice = ref<SpeechSynthesisVoice | null>(null) // 当前选中的语音
    const voiceName = ref<string>('')
    const speakingText = ref<string>('')
    const lastFireTime = ref<number>(0)

    // 系统可用语音列表
    const voices = ref<SpeechSynthesisVoice[]>([])

    // 是否正在朗读
    const isSpeaking = ref(false)

    const updateStatus = (status: boolean) => {
      isSpeaking.value = status
      setIsReading(status)
    }

    // 获取语音选项 (用于UI选择)
    const voiceOptions = computed(() => {
      return voices.value.map((voice) => ({
        name: voice.name,
        lang: voice.lang,
        voice,
      }))
    })

    const japaneseFilter = (x: SpeechSynthesisVoice) =>
      x.lang.indexOf('ja') > -1 && x.lang.indexOf('JP') > -1

    // 初始化语音列表
    const initVoices = () => {
      voices.value = window.speechSynthesis.getVoices().filter(japaneseFilter)
    }

    // 监听语音列表变化
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = initVoices
      initVoices() // 立即初始化
    }

    const beforeSpeak = () => {
      if (voices.value.length > 0) {
        if (voiceName.value) {
          const foundVoice = voices.value.find(
            (v) => v.name === voiceName.value
          )
          voice.value = foundVoice || voices.value[0]
        } else {
          voice.value = voices.value[0]
        }
        voiceName.value = voice.value?.name || ''
      }
      lang.value = voice.value?.lang || lang.value

      stop() // 停止当前朗读
      isSpeaking.value = true
    }

    const initSpeech = (text: string): SpeechSynthesisUtterance => {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.voice = voice.value
      utterance.lang = lang.value
      utterance.rate = rate.value
      utterance.pitch = pitch.value
      utterance.volume = volume.value
      return utterance
    }

    // 朗读单个文本
    const speak = (item: ReadingItem | undefined) => {
      if (isSpeaking.value || !item) return

      updateStatus(true)
      lastFireTime.value = Date.now()
      speakingText.value = item.text
      setNowTextId(item.id)

      beforeSpeak()

      let count = 0
      const speakLoop = () => {
        if (count >= repeatTimes.value) {
          updateStatus(false)
          return
        }

        const utterance = initSpeech(item.text)
        utterance.onend = () => {
          count++
          if (count < repeatTimes.value) {
            speakLoop()
          } else {
            updateStatus(false)
          }
        }

        window.speechSynthesis.speak(utterance)
      }

      speakLoop()
    }

    // 朗读文本列表
    const speakList = (items: ReadingItem[] | undefined = []) => {
      if (!items || items.length === 0 || isSpeaking.value) return

      updateStatus(true)
      speakingText.value = ''
      setNowTextId('')

      beforeSpeak()

      let listRepeatCount = 0
      let currentIndex = 0

      const speakNext = () => {
        if (currentIndex >= items.length) {
          // 完成一轮列表朗读
          currentIndex = 0
          listRepeatCount++

          if (listRepeatCount >= repeatTimes.value) {
            // 完成所有重复次数
            updateStatus(false)
            return
          }
        }

        const item = items[currentIndex]
        speakingText.value = item.text
        setNowTextId(item.id)

        lastFireTime.value = Date.now()
        const utterance = initSpeech(item.text)
        utterance.onend = () => {
          currentIndex++
          speakNext() // 朗读下一句
        }

        window.speechSynthesis.speak(utterance)
      }

      speakNext() // 开始朗读
    }

    // 停止朗读
    const stop = () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
      updateStatus(false)
    }

    const reset = () => {
      lang.value = 'ja-JP'
      voice.value = null
      voiceName.value = ''
      updateStatus(false)
    }

    return {
      voice,
      voiceName,
      voices,
      voiceOptions,
      isSpeaking,
      speakingText,
      lastFireTime,
      initVoices,
      speak,
      speakList,
      stop,
      reset,
    }
  },
  {
    persist: {
      pick: ['voiceName'],
    },
  }
)
