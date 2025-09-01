// 创建单词正则表达式
import type { WordItem } from '../../types'
import type { ConvertParam, OriginalTextMap, OriginalTextParsedMap, ParseRuby, RubyPart } from './types.ts'
import {speakingWordId} from "../../utils";

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

// 高亮替换器
const highlightReplacer = (match: string, words: WordItem[] = []) => {
  match = match.replace(/\s/g, '')
  if (!match) return match

  const word = words.find((w) => w.word === match || w.kana === match)
  if (!word) return match

  return `<a href="#${speakingWordId(word)}" class="highlight-word">${word.word}</a>`
}

// 通用预设处理
const commonPreset = (
  text: string,
  type: keyof OriginalTextParsedMap,
  fn: (val: string) => string
): string => {
  if (!text) return ''

  if (!originalTextMap[text]) {
    originalTextMap[text] = {} as OriginalTextParsedMap
  }

  const cache = originalTextMap[text][type]
  if (cache) return cache

  const res = fn(text) || ''
  originalTextMap[text][type] = res
  return res
}

// 无假名无跳转
const kataFalseWordFalse = ({ originalText = '' }: ConvertParam) => {
  return commonPreset(
    originalText,
    'katakanaFalseWordFalse',
    (param: string) => {
      return param.replace(/!([^(]+)\(([^)]+)\)/g, '$1')
    }
  )
}

// 无假名有跳转
const kataFalseWordTrue = ({ originalText = '', words = [] }: ConvertParam) => {
  const temp = kataFalseWordFalse({ originalText, words })
  return commonPreset(temp, 'katakanaFalseWordTrue', (param: string) => {
    return param.replace(wordRegEx(words), (match) =>
      highlightReplacer(match, words)
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
const kataTrueWordFalse = ({ originalText = '' }: ConvertParam) => {
  return commonPreset(
    originalText,
    'katakanaTrueWordFalse',
    (param: string) => {
      return parseKata(param).outputHtml
    }
  )
}

// 有假名有跳转核心处理
const kataTrueWordTrueCore = (originalText: string = '', words: WordItem[]) => {
  const baseText = kataFalseWordFalse({ originalText })
  if (words.length === 0) return baseText

  let finalText = kataFalseWordTrue({ originalText: baseText, words })

  // 提取注音标记
  const rubyText = originalText.match(/!([^(]+)\(([^)]+)\)/g) || []
  const kanjiKanaMarks: string[][] = rubyText.map((item) => {
    const [, kanji, kana] = item.match(/!([^(]+)\(([^)]+)\)/) || []
    return [kanji, kana]
  })

  const rubyRegEx =
    /(<a\b[^>]*href=["'][^"']*["'][^>]*>)|(<ruby>[^<]*<\/ruby>)|([^<]+)|(<\/a>)/g

  finalText = finalText.replace(
    rubyRegEx,
    (match, hrefPart, rubyPart, textPart, closingTag) => {
      if (hrefPart) return hrefPart
      if (rubyPart) return rubyPart
      if (closingTag) return closingTag
      if (textPart?.trim()) {
        kanjiKanaMarks.reverse()
        for (let i = kanjiKanaMarks.length - 1; i >= 0; i--) {
          const [kanji, kana] = kanjiKanaMarks[i]
          const originalText = textPart
          textPart = textPart.replace(
            new RegExp(`${kanji}(?!(?:(?!<ruby>).)*<\/ruby>)`, 'i'),
            `<ruby>${kanji}<rt data-ruby="${kana}"/></ruby>`
          )
          if (textPart !== originalText) {
            kanjiKanaMarks.splice(i, 1)
          }
        }
        return textPart
      }
      return match
    }
  )
  return finalText
}

// 有假名有跳转
const kataTrueWordTrue = ({ originalText = '', words = [] }: ConvertParam) => {
  return commonPreset(originalText, 'katakanaTrueWordTrue', (param: string) => {
    return kataTrueWordTrueCore(param, words)
  })
}

// 文本解析器
export const textParser = (
  words: WordItem[] = [],
  wordLink = true,
  furigana = true
) => {
  return (originalText: string) => {
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
