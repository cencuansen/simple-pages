import {defineStore} from 'pinia'
import {useDark, useToggle} from '@vueuse/core'

export const useThemeStore = defineStore('theme', () => {
    const isDark = useDark({
        selector: 'html', // 作用于html元素
        attribute: 'class', // 使用class方式
        valueDark: 'dark', // dark模式时的class名
        valueLight: 'light', // light模式时的class名
        storageKey: 'theme', // 本地存储的key
        storage: localStorage // 使用localStorage
    })

    const toggleDark = useToggle(isDark)

    return {
        isDark,
        toggleDark
    }
})