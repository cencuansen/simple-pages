import {defineStore} from 'pinia'
import {useDark, useToggle} from '@vueuse/core'
import {ref} from "vue";

export const useBaseSettingStore = defineStore('baseSetting', () => {

    /* ------------- 主题 --------------- */
    const isDark = useDark()
    const toggleDark = useToggle(isDark)

    /* ------------- 注音 --------------- */
    const furiganaEnable = ref(true)

    return {
        isDark,
        furiganaEnable,
        toggleDark,
    }
}, {
    persist: {
        pick: ["isDark", "furiganaEnable"],
    }
})