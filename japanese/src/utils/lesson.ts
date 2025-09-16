// 创建单词正则表达式
import type { WordItem } from '@/types/word.ts'
import type {
  ConvertParam,
  OriginalTextMap,
  OriginalTextParsedMap,
  ParseRuby,
  RubyPart,
  Lesson,
  LessonSearch,
} from '@/types/lesson.ts'

const originalTextMap: OriginalTextMap = {}

const wordRegEx = (words: WordItem[]) => {
  const wordCopy = [...words].sort((a, b) => b.word.length - a.word.length)
  return new RegExp(
    wordCopy
      .map(
        (word) => word.word
        // .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        // .split('')
        // .join('\\s*')
      )
      .join('|'),
    'g'
  )
}

// 获取朗读假名
export const speakText = (text: string | undefined = '') =>
  text.replace(/![^(]+\(([^)]+)\)/g, '$1')

const buildAnchorLink = (match: string, words: WordItem[] = []) => {
  match = match.replace(/\s/g, '')
  if (!match) return match
  const word = words.find((w) => w.word === match || w.kana === match)
  if (!word) return match
  return `<a href="#${word.textId}" class="anchor-link">${match}</a>`
}

// 通用预设处理
const process = (
  text: string,
  type: keyof OriginalTextParsedMap,
  ...fns: ((val: string) => string)[]
): string => {
  if (!text || !type) return ''

  if (!originalTextMap[text]) {
    originalTextMap[text] = {} as OriginalTextParsedMap
  }

  // let res: string = originalTextMap[text][type]

  let res: string = text
  for (const fn of fns || []) {
    res = fn?.call(this, res)
  }
  res && (originalTextMap[text][type] = res)
  return res
}

// 无假名无跳转
export const kataFalseWordFalse = ({ originalText = '' }: ConvertParam) => {
  return process(originalText, 'katakanaFalseWordFalse', (param: string) => {
    return param.replace(/!([^(]+)\(([^)]+)\)/g, '$1')
  })
}

// 对"无假名无跳转"封装
export const displayText = (text: string) =>
  kataFalseWordFalse({ originalText: text })

// 无假名有跳转
export const kataFalseWordTrue = ({
  originalText = '',
  words = [],
}: ConvertParam) => {
  const temp = kataFalseWordFalse({ originalText, words })
  return process(temp, 'katakanaFalseWordTrue', (param: string) => {
    const regexp = wordRegEx(words)
    return param.replace(regexp, (match) => buildAnchorLink(match, words))
  })
}

// 解析假名
const parseKata = (input: string): ParseRuby => {
  const rubyParts: RubyPart[] = []
  let output = ''
  let i = 0
  let position = 0

  while (i < input.length) {
    if (input[i] === '!') {
      i++ // 跳过'!'字符
      const kanjiStart = i
      let kanjiEnd = i

      // 提取汉字
      while (kanjiEnd < input.length && input[kanjiEnd] !== '(') {
        kanjiEnd++
      }

      const kanji = input.substring(kanjiStart, kanjiEnd)
      i = kanjiEnd

      if (input[i] === '(') {
        i++
        const kanaStart = i
        let kanaEnd = i

        // 提取假名
        while (kanaEnd < input.length && input[kanaEnd] !== ')') {
          kanaEnd++
        }

        const kana = input.substring(kanaStart, kanaEnd)
        i = kanaEnd + 1

        // 记录位置信息
        rubyParts.push({
          text: kanji,
          kana: kana,
          position: position,
          length: kanji.length,
        })

        // 添加到输出
        output += `<ruby>${kanji}<rt data-ruby="${kana}"/></ruby>`
        position += kanji.length
      }
    } else {
      // 普通文本
      output += input[i]
      position++
      i++
    }
  }

  return { rubyParts, outputHtml: output }
}

// 有假名无跳转
export const kataTrueWordFalse = ({ originalText = '' }: ConvertParam) => {
  return process(originalText, 'katakanaTrueWordFalse', (param: string) => {
    return parseKata(param).outputHtml
  })
}

// 有假名有跳转核心处理
export const kataTrueWordTrueCore = (
  originalText: string = '',
  words: WordItem[]
) => {
  const baseText = kataFalseWordFalse({ originalText })
  if (words.length === 0) return baseText

  let finalText = kataFalseWordTrue({ originalText: baseText, words })

  // 提取注音标记
  const rubyText = originalText.match(/!([^(]+)\(([^)]+)\)/g) || []
  const kanjiKanaMarks: string[][] = rubyText.map((item) => {
    const [, kanji, kana] = item.match(/!([^(]+)\(([^)]+)\)/) || []
    return [kanji, kana]
  })

  const replaceAt = (
    text: string,
    search: string,
    replace: string,
    index: number
  ) => text.slice(0, index) + text.slice(index).replace(search, replace)

  let lastIndex = 0
  for (let i = 0; i < kanjiKanaMarks.length; i++) {
    const item = kanjiKanaMarks[i]
    const index = finalText.indexOf(item[0], lastIndex)
    const replace = `<ruby>${item[0]}<rt data-ruby="${item[1]}"/></ruby>`
    lastIndex = index + replace.length
    finalText = replaceAt(finalText, item[0], replace, index)
  }
  return finalText
}

// 有假名有跳转
export const kataTrueWordTrue = ({
  originalText = '',
  words = [],
}: ConvertParam) => {
  return process(originalText, 'katakanaTrueWordTrue', (param: string) => {
    return kataTrueWordTrueCore(param, words)
  })
}

// 文本解析器
export const textParser = (
  words: WordItem[] = [],
  wordLink = true,
  furigana = true
): ((str: string | undefined) => string) => {
  return (originalText: string | undefined) => {
    if (!originalText) return ''
    if (furigana && wordLink) {
      return kataTrueWordTrue({ originalText, words })
    } else if (!furigana && !wordLink) {
      return kataFalseWordFalse({ originalText })
    } else if (furigana && !wordLink) {
      return kataTrueWordFalse({ originalText })
    } else if (!furigana && wordLink) {
      return kataFalseWordTrue({ originalText, words })
    }
    return ''
  }
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