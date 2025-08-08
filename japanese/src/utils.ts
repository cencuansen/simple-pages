import type {WordItem} from "./types"
import {useSpeechStore} from "./stores/speechStore"

export const speakingTextId = (str: string): string => `text-${str}`

export const speakingWordId = (word: WordItem): string => `word-${word.lesson}-${word.idx}`

export const speakingId = (): string => {
    let id = null
    const speechStore = useSpeechStore()
    if (speechStore.speakingWord) {
        id = speakingWordId(speechStore.speakingWord)
    } else {
        id = speakingTextId(speechStore.speakingText)
    }
    return id || ""
}

export type TextMatchReplacer = (text: string) => string;

export const matchTextFunc = (keyword: string): TextMatchReplacer => {
    if (!keyword) {
        return (text: string) => text
    }
    const escapedKey = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(${escapedKey})`, 'g') // 添加捕获组
    return (text: string) => text?.replace(regex, '<span class="match">$1</span>')
}