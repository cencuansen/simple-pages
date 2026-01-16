import type { Lesson, LessonRelation } from '@/types/lesson.ts'
import ky from 'ky'
import Papa from 'papaparse'

// 1. 提取基础配置
const jsonBase = import.meta.env.VITE_JSON_BASE
const lessonBase = import.meta.env.VITE_LESSON_JSON_BASE
const translationBase = import.meta.env.VITE_LESSON_TRANSLATION_JSON_BASE

// 创建带有时间戳缓存消除的 ky 实例
const api = ky.create({
  hooks: {
    beforeRequest: [
      (request) => {
        const url = new URL(request.url)
        url.searchParams.set('t', Date.now().toString())
        return new Request(url, request)
      },
    ],
  },
})

/**
 * 核心工具函数：获取并解析 CSV 为 Map
 */
const fetchCsvToMap = async (url: string): Promise<Map<string, string>> => {
  const text = await api.get(url).text()

  return new Promise((resolve, reject) => {
    Papa.parse<LessonRelation>(text, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (result) => {
        const map = new Map<string, string>()
        result.data.forEach((item) => {
          if (item.textId) map.set(item.textId, item.content)
        })
        resolve(map)
      },
      error: (error: any) => reject(error),
    })
  })
}

// --- 导出的 API ---

export const getLessonLite = async (): Promise<Lesson[]> => {
  return await api.get(`${jsonBase}/lesson-lite.json`).json()
}

export const getLessonContent = (lessonIndex: number) =>
  fetchCsvToMap(`${lessonBase}/${lessonIndex}.csv`)

export const getLessonContents = () =>
  fetchCsvToMap(`${jsonBase}/lesson-contents.csv`)

export const getLessonTranslation = (lessonIndex: number) =>
  fetchCsvToMap(`${translationBase}/${lessonIndex}.csv`)

export const getLessonTranslations = () =>
  fetchCsvToMap(`${jsonBase}/lesson-translations.csv`)
