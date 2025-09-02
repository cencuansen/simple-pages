import type { WordItem } from '../types'
import { useSpeechStore } from '../stores/speechStore.ts'

export const speakingTextId = (str: string): string => `text-${str}`

export const speakingWordId = (word: WordItem): string =>
  `word-${word.lesson}-${word.idx}`

export const speakingId = (): string => {
  let id = null
  const speechStore = useSpeechStore()
  if (speechStore.speakingWord) {
    id = speakingWordId(speechStore.speakingWord)
  } else {
    id = speakingTextId(speechStore.speakingText)
  }
  return id || ''
}

export type TextMatchReplacer = (text: string) => string

export const searchLessonFunc = (keyword: string | null): TextMatchReplacer => {
  if (!keyword) {
    return (text: string) => text
  }
  const escapedKey = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escapedKey})`, 'g') // 添加捕获组
  return (text: string) => text?.replace(regex, '<span class="match">$1</span>')
}

export const detectBrowser = () => {
  const ua = navigator.userAgent
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)

  // 桌面端检测
  if (!isMobile) return { type: 'desktop', browser: 'desktop' }

  // 安卓浏览器检测
  if (/Android/i.test(ua)) {
    if (/Chrome\/[\d.]+ Mobile/i.test(ua) && !/EdgA\/[\d.]+/.test(ua)) {
      return { type: 'android', browser: 'chrome' }
    }
    if (/EdgA\/[\d.]+/.test(ua)) {
      return { type: 'android', browser: 'edge' }
    }
    return { type: 'android', browser: 'other' }
  }

  return { type: 'other', browser: 'unknown' }
}

// 获取朗读假名
export const speakText = (text: string | undefined = '') =>
  text.replace(/![^(]+\(([^)]+)\)/g, '$1')

export const isNumber = (value: number | null | undefined) => {
  return typeof value === 'number' && Number.isFinite(value)
}
