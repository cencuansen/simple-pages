import {defineStore} from 'pinia'
import {useDark, useToggle} from '@vueuse/core'
import {ref} from "vue";

export const useBaseSettingStore = defineStore('baseSetting', () => {

    const isDark = useDark()
    const toggleDark = useToggle(isDark)

    const furigana = ref(true)

    const wordLink = ref(true)

    const style = ref({
        fontSize: "12px"
    })

    const translate = ref(true)

    const speak = ref(true)

    return {
        isDark,
        style,
        wordLink,
        furigana,
        translate,
        speak,
        toggleDark,
    }
}, {
    persist: true
})