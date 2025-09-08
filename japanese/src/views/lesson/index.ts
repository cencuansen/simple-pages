// 创建单词正则表达式
import type { WordItem } from '../../types'
import type {
  ConvertParam,
  OriginalTextMap,
  OriginalTextParsedMap,
  ParseRuby,
  RubyPart,
} from './types.ts'
import { speakingWordId } from '../../utils'

const originalTextMap: OriginalTextMap = {}

const wordRegEx = (words: WordItem[]) => {
  const wordCopy = [...words].sort((a, b) => b.word.length - a.word.length)
  return new RegExp(
    wordCopy
      .map((word) =>
        word.word
          .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          .split('')
          .join('\\s*')
      )
      .join('|'),
    'g'
  )
}

const buildAnchorLink = (match: string, words: WordItem[] = []) => {
  match = match.replace(/\s/g, '')
  if (!match) return match

  const word = words.find((w) => w.word === match || w.kana === match)
  if (!word) return match

  return `<a href="#${speakingWordId(word)}" class="anchor-link">${word.word}</a>`
}

// 通用预设处理
const process = (
  text: string,
  type: keyof OriginalTextParsedMap,
  ...fns: ((val: string) => string)[]
): string => {
  if (!text) return ''

  if (!originalTextMap[text]) {
    originalTextMap[text] = {} as OriginalTextParsedMap
  }

  let res: string = originalTextMap[text][type]

  if (!res) {
    for (const fn of fns || []) {
      res = fn?.call(this, text)
    }
    res && (originalTextMap[text][type] = res)
  }

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
    return param.replace(wordRegEx(words), (match) =>
      buildAnchorLink(match, words)
    )
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
