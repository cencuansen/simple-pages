import { defineStore } from 'pinia'
import { useDark, useToggle } from '@vueuse/core'
import { ref } from 'vue'

export const useBaseSettingStore = defineStore(
  'baseSetting',
  () => {
    const isDark = useDark()
    const toggleDark = useToggle(isDark)

    const furigana = ref(true)
    const furiganaToggle = () => {
      furigana.value = !furigana.value
    }

    const wordLink = ref(true)
    const wordLinkToggle = () => {
      wordLink.value = !wordLink.value
    }

    const style = ref({
      fontSize: '12px',
    })

    const translate = ref(true)

    const word = ref(true)
    const kana = ref(true)
    const wordDesc = ref(true)
    const wordDict = ref(true)

    const audioSpeak = ref(true)
    const ttsSpeak = ref(true)

    const fullscreen = ref(false)

    const setFullscreen = (newStatus: boolean) => {
      fullscreen.value = newStatus
    }

    const basicsTranslate = ref(false)
    const setBasicsTranslate = (newStatus: boolean) => {
      basicsTranslate.value = newStatus
    }

    const exchangeTranslate = ref<boolean[]>(new Array(100).fill(false))
    const setExchangeTranslate = (newStatus: boolean) => {
      for (let i = 0; i < exchangeTranslate.value.length; i++) {
        exchangeTranslate.value[i] = newStatus
      }
    }

    const exchange2Translate = ref<boolean[]>(new Array(100).fill(false))
    const setExchange2Translate = (newStatus: boolean) => {
      for (let i = 0; i < exchange2Translate.value.length; i++) {
        exchange2Translate.value[i] = newStatus
      }
    }

    const allTranslate = ref(false)
    const setAllTranslate = (newStatus: boolean) => {
      allTranslate.value = newStatus
      setBasicsTranslate(newStatus)
      setExchangeTranslate(newStatus)
      setExchange2Translate(newStatus)
    }

    return {
      isDark,
      style,
      wordLink,
      furigana,
      translate,
      word,
      kana,
      wordDesc,
      wordDict,
      audioSpeak,
      ttsSpeak,
      toggleDark,
      fullscreen,
      allTranslate,
      basicsTranslate,
      exchangeTranslate,
      exchange2Translate,
      furiganaToggle,
      wordLinkToggle,
      setFullscreen,
      setAllTranslate,
      setBasicsTranslate,
      setExchangeTranslate,
      setExchange2Translate,
    }
  },
  {
    persist: true,
  }
)
