// 创建单词正则表达式
import type {
  LessonRelation,
  LessonSearch,
  LessonSearchContent,
} from '@/types/lesson'
import { validIndex } from '@/constants/lesson'

// 获取朗读假名
export const speakText = (text: string | undefined = '') =>
  text.replace(/![^(]+\(([^)]+)\)/g, '$1')

/**
 * 提取纯文本：去掉 […‖id] 和 {surface|reading} 标记，只保留文字表层内容。
 */
function extractPlainText(input: string): string {
  return (
    input
      // 去掉带锚点的方括号，只保留中间内容
      .replace(/\[([^\]]*?)‖[^\]]*?\]/g, '$1')
      // 将所有 {surface|reading} → surface
      .replace(/\{([^|}]+)\|[^}]+\}/g, '$1')
  )
}

/**
 * 提取带假名的文本：先去掉 […‖id]，再把全串的 {surface|reading} 转成 <ruby>…</ruby>。
 */
function extractTextWithRuby(input: string): string {
  // 1. 去掉锚点标记
  const withoutAnchors = input.replace(/\[([^\]]*?)‖[^\]]*?\]/g, '$1')

  // 2. 全局 ruby 化
  return withoutAnchors.replace(
    /\{([^|}]+)\|([^}]+)\}/g,
    `<ruby>$1<rt d='$2'/></ruby>`
  )
}

/**
 * 提取带锚点的文本：把 […‖id] 里的内容（去掉 {…} 注音）包成 <a>，
 其他 {surface|reading} 则仅取 surface。
 */
function extractTextWithAnchor(input: string): string {
  // 1. 先把带锚点的方括号处理成 <a>…</a>
  const withAnchors = input.replace(
    /\[([^\]]*?)‖([^\]]*?)\]/g,
    (_match, content, id) => {
      // content 可能含 {surface|reading}，去掉注音只留 surface
      const plain = content.replace(/\{([^|}]+)\|[^}]+\}/g, '$1')
      return `<a href='#${id}' class='anchor-link' tabindex="-1">${plain}</a>`
    }
  )

  // 2. 再把剩余的 {surface|reading} → surface
  return withAnchors.replace(/\{([^|}]+)\|[^}]+\}/g, '$1')
}

/**
 * 提取带假名和锚点的文本：
 * - […‖id] 先 ruby 化内部 {…}，然后包成 <a>。
 * - 剩余花括号也 ruby 化。
 */
function extractTextWithRubyAndAnchor(input: string): string {
  // 1. 先处理方括号：内部 ruby，再包 <a>
  const anchorProcessed = input.replace(
    /\[([^\]]*?)‖([^\]]*?)\]/g,
    (_match, content, id) => {
      // ruby 化内部所有 {surface|reading}
      const withRuby = content.replace(
        /\{([^|}]+)\|([^}]+)\}/g,
        `<ruby>$1<rt d='$2'/></ruby>`
      )
      return `<a href='#${id}' class='anchor-link' tabindex="-1">${withRuby}</a>`
    }
  )

  // 2. 全局 ruby 化剩余 {surface|reading}
  return anchorProcessed.replace(
    /\{([^|}]+)\|([^}]+)\}/g,
    `<ruby>$1<rt d='$2'/></ruby>`
  )
}

// 文本解析器
export const textParser = (
  wordLink = true,
  furigana = true
): ((str: string | undefined) => string) => {
  return (originalText: string | undefined) => {
    if (!originalText) return ''
    if (furigana && wordLink) {
      return extractTextWithRubyAndAnchor(originalText)
    } else if (!furigana && !wordLink) {
      return extractPlainText(originalText)
    } else if (furigana && !wordLink) {
      return extractTextWithRuby(originalText)
    } else if (!furigana && wordLink) {
      return extractTextWithAnchor(originalText)
    }
    return ''
  }
}

// 对"无假名无跳转"封装
export const displayText = (text: string) => extractPlainText(text)

// 加工文本，主要显示 keyword 周围的文本，其他用省略号代替
function toKeywordCoreContent(
  text: string,
  keyword: string,
  contextLength: number = 10
): string {
  if (!text || !keyword) return ''

  const results: string[] = []
  const lowerText = text.toLowerCase()
  const lowerKeyword = keyword.toLowerCase()
  const keywordLength = keyword.length

  let positions: number[] = []
  let currentIndex = 0

  // 找到所有关键词位置
  while (
    (currentIndex = lowerText.indexOf(lowerKeyword, currentIndex)) !== -1
  ) {
    positions.push(currentIndex)
    currentIndex += keywordLength
  }

  if (positions.length === 0) return ''

  // 合并相邻的关键词
  const mergedRanges: [number, number][] = []
  let currentRange: [number, number] = [
    positions[0],
    positions[0] + keywordLength,
  ]

  for (let i = 1; i < positions.length; i++) {
    const currentPos = positions[i]
    const previousEnd = currentRange[1]

    // 如果当前关键词与前一个关键词的距离小于等于上下文长度的2倍，则合并
    if (currentPos - previousEnd <= contextLength * 2) {
      currentRange[1] = currentPos + keywordLength
    } else {
      mergedRanges.push([...currentRange])
      currentRange = [currentPos, currentPos + keywordLength]
    }
  }
  mergedRanges.push(currentRange)

  // 为每个范围构建结果
  mergedRanges.forEach(([start, end]) => {
    const contextStart = Math.max(0, start - contextLength)
    const contextEnd = Math.min(text.length, end + contextLength)
    results.push(text.substring(contextStart, contextEnd))
  })
  return `... ${results.join(' ... ')} ...`
}

export const searchLesson = (
  lessons: LessonRelation[],
  keyword: string | undefined
): LessonSearch[] => {
  const result: LessonSearch[] = []
  const allIndex = [...new Set(lessons.map((lesson) => lesson.index))]
  for (const index of allIndex) {
    const singleLesson = lessons.filter((lesson) => lesson.index === index)
    result.push({
      idx: index.toString(),
      title: '',
      contents: singleLesson.map((lesson) => {
        return {
          textId: lesson.textId,
          text: lesson.content,
        }
      }),
    })
  }

  console.log('keyword', keyword)

  if (!keyword) {
    result.forEach((item) => {
      item.contents = item.contents.slice(0, 2)
      item.contents.push({
        textId: '',
        text: '...',
      })
    })
    return result
  }

  const keywordHighlight = (text: string, keyword: string): string => {
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
      return text.replace(
        regex,
        '<span style="color:var(--el-color-primary)">$1</span>'
      )
    }
    return ''
  }

  const doHighlight = (
    textId: string,
    text: string,
    keyword: string
  ): LessonSearchContent => {
    if (!text.includes(keyword)) {
      return { textId: '', text: '' }
    }
    const liteText = toKeywordCoreContent(text, keyword)
    const result = keywordHighlight(liteText, keyword)
    return { textId, text: result }
  }

  result.forEach((item) => {
    item.contents = item.contents
      .map((content) => doHighlight(content.textId, content.text, keyword))
      .filter((c) => Boolean(c.text))
  })
  return result.filter((item) => Boolean(item.contents.length))
}

export const trim = (text: string) => {
  return text.replace(/[ \u3000]/g, '')
}

export const hasNext = (lessonIndex: number) => {
  if (!Boolean(lessonIndex)) return false
  const position: number = validIndex.indexOf(lessonIndex)
  if (position === -1) return false
  if (position === validIndex.length - 1) return false
  return true
}

export const nextIndex = (lessonIndex: number): number => {
  if (!Boolean(lessonIndex)) return validIndex[0]
  const position: number = validIndex.indexOf(lessonIndex)
  if (position === -1) return validIndex[0]
  if (position === validIndex.length - 1) return lessonIndex
  return validIndex[position + 1]
}

export const hasPrev = (lessonIndex: number) => {
  if (!Boolean(lessonIndex)) return false
  const position: number = validIndex.indexOf(lessonIndex)
  if (position === -1) return false
  if (position === 0) return false
  return true
}

export const prevIndex = (lessonIndex: number): number => {
  if (!Boolean(lessonIndex)) return validIndex[0]
  const position: number = validIndex.indexOf(lessonIndex)
  if (position === -1) return validIndex[0]
  if (position === 0) return lessonIndex
  return validIndex[position - 1]
}

export const checkIndex = (lessonIndex: number): number => {
  if (!Boolean(lessonIndex)) return validIndex[0]
  if (validIndex.includes(lessonIndex)) return lessonIndex
  return validIndex[0]
}
