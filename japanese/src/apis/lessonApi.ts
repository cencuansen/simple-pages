import type { Lesson, LessonRelation } from '@/types/lesson.ts'
import ky from 'ky'
import Papa from 'papaparse'

const jpJsonBase = import.meta.env.VITE_JSON_BASE
const jpLessonJsonBase = import.meta.env.VITE_LESSON_JSON_BASE

export const getLessonLite = async (): Promise<Lesson[]> => {
  const response = await ky(`${jpJsonBase}/lesson-lite.json?t=${Date.now()}`)
  return await response.json()
}

export const getLessonContent = async (
  lessonIndex: number
): Promise<Map<string, string>> => {
  // 获取单个课程内容
  const map: Map<string, string> = new Map()
  const url = `${jpLessonJsonBase}/${lessonIndex}.csv?t=${Date.now()}`
  const response = await ky(url)
  const lessonContentText = await response.text()
  Papa.parse<LessonRelation>(lessonContentText, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
    complete: (result) => {
      result.data.forEach((item) => {
        map.set(item.textId, item.content)
      })
    },
    error: (_: any) => {},
  })
  return map
}

export const getLessonContents = async (): Promise<Map<string, string>> => {
  // 获取全量课程内容
  const map: Map<string, string> = new Map()
  const url = `${jpJsonBase}/lesson-contents.csv?t=${Date.now()}`
  const response = await ky(url)
  const lessonContentText = await response.text()
  Papa.parse<LessonRelation>(lessonContentText, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
    complete: (result) => {
      result.data.forEach((item) => {
        map.set(item.textId, item.content)
      })
    },
    error: (_: any) => {},
  })
  return map
}

export const getLessonTranslations = async (): Promise<Map<string, string>> => {
  const map: Map<string, string> = new Map()
  const lessonTranslationResponse = await ky(
    `${jpJsonBase}/lesson-translations.csv?t=${Date.now()}`
  )
  const lessonTranslationText = await lessonTranslationResponse.text()
  Papa.parse<LessonRelation>(lessonTranslationText, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
    complete: (result) => {
      result.data.forEach((item) => {
        map.set(item.textId, item.content)
      })
    },
    error: (_: any) => {},
  })
  return map
}
