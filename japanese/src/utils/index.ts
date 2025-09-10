import type { Lesson } from '../views/lesson/types.ts'
import { displayText } from '../views/lesson'
import { v4 as uuidv4 } from 'uuid'

export const newTextId = () => `i_${uuidv4().split('-')[4]}`

export interface LessonSearch {
  idx: string
  title: string
  contents: string[]
}

export const searchLesson = (
  lessons: Lesson[],
  keyword: string | undefined
): LessonSearch[] => {
  const flatLessons = lessons.map((lesson) => {
    return [
      `${lesson.index}`,
      lesson.title,
      ...lesson.sentences.map((a) => displayText(a.content)),
      ...lesson.conversations
        .flatMap((a) => a)
        .map((a) => displayText(a.content)),
      ...lesson.discussions.contents
        .flatMap((a) => a)
        .map((a) => displayText(a.content)),
      ...lesson.article.contents.map((a) => displayText(a.content)),
    ].filter(Boolean) as string[]
  })

  if (!keyword) {
    return flatLessons
      .map((lesson) => {
        const contents = lesson.slice(2)
        return {
          idx: lesson[0],
          title: lesson[1],
          contents: [...contents.slice(0, 2), '...'],
        }
      })
      .filter((a) => a.contents.length > 0)
  }

  const keywordHighlight = (
    text: string,
    keyword: string
  ): string | undefined => {
    if (!text || !keyword) {
      return text
    }
    // 将关键词拆分为字符数组
    const keywordChars = keyword.split('')
    // 创建正则表达式模式：每个字符后面可以跟0个或多个空格
    const pattern = keywordChars
      .map(
        (char) =>
          // 对特殊字符进行转义
          char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*'
      )
      .join('')
    // 构建正则表达式，使用捕获组来保留匹配的完整文本
    const regex = new RegExp(`(${pattern})`, 'gi')
    if (regex.test(text)) {
      // 替换匹配的文本
      return text.replace(regex, '<span class="active">$1</span>')
    }
    return ''
  }

  return flatLessons
    .map((lesson: string[]) => {
      const contents: string[] = lesson
        .slice(2)
        .map((text: string) => keywordHighlight(text, keyword))
        .filter(Boolean) as string[]
      return { idx: lesson[0], title: lesson[1], contents }
    })
    .filter((a: LessonSearch) => a.contents.length > 0)
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
