import {defineStore} from 'pinia'
import {useDark, useToggle} from '@vueuse/core'
import {ref} from "vue";

export const useBaseSettingStore = defineStore('baseSetting', () => {

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
        fontSize: "12px"
    })

    const translate = ref(true)

    const word = ref(true)
    const kana = ref(true)
    const wordDesc = ref(true)

    const audioSpeak = ref(true)
    const ttsSpeak = ref(true)

    return {
        isDark,
        style,
        wordLink,
        furigana,
        translate,
        word,
        kana,
        wordDesc,
        audioSpeak,
        ttsSpeak,
        toggleDark,
        furiganaToggle,
        wordLinkToggle
    }
}, {
    persist: true
})
