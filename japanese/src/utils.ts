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