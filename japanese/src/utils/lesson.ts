// 创建单词正则表达式
import type { Lesson, LessonSearch } from '@/types/lesson.ts'

// 获取朗读假名
export const speakText = (text: string | undefined = '') =>
  text.replace(/![^(]+\(([^)]+)\)/g, '$1')

interface ParseTextBlock {
  type: 'plain' | 'annotated' | 'anchored'
  content: string
  reading?: string
  id?: string
}

// 解析文本中的标记块
function parseTextBlocks(text: string): ParseTextBlock[] {
  // 匹配三种格式：
  // 1. 带注音和锚点: [{单词|读音}|id]
  // 2. 只带锚点: [单词|id]
  // 3. 只带注音: {单词|读音}
  // 4. 纯文本
  const pattern =
    /\[{([^|]+)\|([^}]+)}\|([^\]]+)\]|\[([^|]+)\|([^\]]+)\]|\{([^|]+)\|([^}]+)\}|([^[\]{}]+)/g
  const blocks: ParseTextBlock[] = []
  let match

  while ((match = pattern.exec(text)) !== null) {
    if (match[1] && match[2] && match[3]) {
      // 格式1: [{单词|读音}|id] - 带注音和锚点
      blocks.push({
        type: 'annotated',
        content: match[1],
        reading: match[2],
        id: match[3],
      })
    } else if (match[4] && match[5]) {
      // 格式2: [单词|id] - 只带锚点
      blocks.push({
        type: 'anchored',
        content: match[4],
        id: match[5],
      })
    } else if (match[6] && match[7]) {
      // 格式3: {单词|读音} - 只带注音
      blocks.push({
        type: 'annotated',
        content: match[6],
        reading: match[7],
      })
    } else if (match[8]) {
      // 纯文本部分
      blocks.push({
        type: 'plain',
        content: match[8],
      })
    }
  }

  return blocks
}

// 1、提取纯文本
function extractPlainText(text: string): string {
  const blocks = parseTextBlocks(text)
  return blocks.map((block) => block.content).join('')
}

// 2、纯文本带注音假名
function extractTextWithRuby(text: string): string {
  const blocks = parseTextBlocks(text)

  return blocks
    .map((block) => {
      if (block.type === 'plain' || block.type === 'anchored') {
        return block.content
      } else {
        return `<ruby>${block.content}<rt d='${block.reading}'/></ruby>`
      }
    })
    .join('')
}

// 3、纯文本带锚点
function extractTextWithAnchor(text: string): string {
  const blocks = parseTextBlocks(text)

  return blocks
    .map((block) => {
      if (block.type === 'plain' || (block.type === 'annotated' && !block.id)) {
        // 纯文本或没有id的注音文本
        return block.content
      } else if (block.id) {
        // 有id的文本（无论是注音还是纯锚点）
        return `<a href='#${block.id}' class="anchor-link">${block.content}</a>`
      } else {
        return block.content
      }
    })
    .join('')
}

// 4、纯文本注音假名带锚点
function extractTextWithRubyAndAnchor(text: string): string {
  const blocks = parseTextBlocks(text)

  return blocks
    .map((block) => {
      if (block.type === 'plain') {
        return block.content
      } else if (block.type === 'anchored') {
        // 只有锚点的情况
        return `<a href='#${block.id}' class="anchor-link">${block.content}</a>`
      } else if (block.id) {
        // 有注音和锚点的情况
        return `<a href='#${block.id}' class="anchor-link"><ruby>${block.content}<rt d='${block.reading}'/></ruby></a>`
      } else {
        // 只有注音的情况
        return `<ruby>${block.content}<rt d='${block.reading}'/></ruby>`
      }
    })
    .join('')
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
