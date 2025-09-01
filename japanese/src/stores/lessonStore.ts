import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { isNumber, speakingWordId } from '../utils.ts'
import type { WordItem } from '../types'

export interface TextBase {
  content: string
  time: string
  translation?: string
}

export interface Conversation {
  speaker?: string
  content: string
  base?: string
  display?: string
  time: string
  translation?: string
}

export interface Discussion {
  title: string
  time: string
  contents: Conversation[][]
}

export interface Article {
  title: string
  time: string
  contents: TextBase[]
}

export interface Lesson {
  index: number
  title: string
  audio: string
  sentences: TextBase[]
  conversations: Conversation[][]
  discussions: Discussion
  article: Article
}

const jpJsonBase = import.meta.env.VITE_JSON_BASE

export const useLessonStore = defineStore(
  'lessons',
  () => {
    const lessons = ref<Lesson[]>([])
    const isLoading = ref(false)
    const error = ref<string | null>(null)
    const currentIndex = ref(-1)

    const minIndex = ref(0)
    const maxIndex = ref(0)

    const fetchLessons = async () => {
      try {
        isLoading.value = true
        error.value = null
        const response = await fetch(`${jpJsonBase}/lesson.json`)
        lessons.value = await response.json()
        minIndex.value = lessons.value[0].index
        maxIndex.value = lessons.value[lessons.value.length - 1].index

        if (!isValidLessonIndex(currentIndex.value)) {
          currentIndex.value = minIndex.value
        }
      } catch (err) {
        error.value =
          err instanceof Error ? err.message : 'Failed to fetch lessons'
        console.error('Error fetching lessons:', err)
      } finally {
        isLoading.value = false
      }
    }

    const isValidLessonIndex = (index: number): boolean =>
      isNumber(index) && index >= minIndex.value && index <= maxIndex.value

    // 切换课程
    const setCurrentIndex = (index: number) => {
      isValidLessonIndex(index) && (currentIndex.value = index)
    }

    const currentLesson = computed(() =>
      lessons.value.find((item) => item.index === currentIndex.value)
    )

    // 全部课程号
    const lessonIndexs = computed(() => lessons.value.map((les) => les.index))

    const hasPrevious = computed(() => {
      // 课程号在数组中位置
      const position = lessonIndexs.value.indexOf(currentIndex.value)
      const isValid = lessonIndexs.value[position - 1]
      return Boolean(isValid)
    })

    const hasNext = computed(() => {
      // 课程号在数组中位置
      const position = lessonIndexs.value.indexOf(currentIndex.value)
      const isValid = lessonIndexs.value[position + 1]
      return Boolean(isValid)
    })

    const goPrevious = () => {
      const position = lessonIndexs.value.indexOf(currentIndex.value)
      const value = lessonIndexs.value[position - 1]
      Boolean(value) && (currentIndex.value = value)
    }

    const goNext = () => {
      const position = lessonIndexs.value.indexOf(currentIndex.value)
      const value = lessonIndexs.value[position + 1]
      Boolean(value) && (currentIndex.value = value)
    }

    const goLesson = (num: number) => {
      currentIndex.value = num
    }

    // 课文内容处理：假名提取，单词跳转等
    const wordRegEx = (words: WordItem[]) => {
      let wordCopy = words.slice()
      wordCopy.sort((a, b) => b.word.length - a.word.length)
      return new RegExp(
        wordCopy
          .map(
            (word) =>
              word.word
                .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                .split('') // 将单词拆分为字符数组
                .join('\\s*') // 在每个字符之间添加\s*以匹配任意空格
          )
          .join('|'),
        'g'
      )
    }

    const highlightReplacer = (match: string, words: WordItem[] = []) => {
      match = match.replace(/\s/g, '')
      if (!match) return match
      const word = words.find((w) => w.word === match || w.kana === match)
      if (!word) return match
      return `<a href="#${speakingWordId(word)}" class="highlight-word">${word?.word}</a>`
    }

    interface OriginalTextParsedMap {
      [key: string]: any

      // 原始数据
      sourceText: string
      // 只提取假名，用于朗读
      onlyKatakana: string
      // 无假名无跳转
      katakanaFalseWordFalse: string
      // 无假名有跳转
      katakanaFalseWordTrue: string
      // 有假名无跳转
      katakanaTrueWordFalse: string
      // 有假名有跳转
      katakanaTrueWordTrue: string
    }

    interface OriginalTextMap {
      [key: string]: OriginalTextParsedMap
    }

    const originalTextMap: OriginalTextMap = {}

    const commonPreset = (
      text: string,
      type:
        | 'katakanaFalseWordFalse'
        | 'katakanaFalseWordTrue'
        | 'katakanaTrueWordFalse'
        | 'katakanaTrueWordTrue',
      fn: (val: string) => string
    ): string => {
      if (!text) {
        return ''
      }
      if (!originalTextMap[text]) {
        originalTextMap[text] = {} as OriginalTextParsedMap
      }
      const cache = originalTextMap[text][type]
      if (cache) {
        return cache
      }
      const res = (fn && fn(text)) || ''
      originalTextMap[text][type] = res
      return res
    }

    interface ConvertParam {
      originalText: string
      words?: WordItem[]
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
    const kataFalseWordTrue = ({
      originalText = '',
      words = [],
    }: ConvertParam) => {
      const temp = kataFalseWordFalse({ originalText, words })
      return commonPreset(temp, 'katakanaFalseWordTrue', (param: string) => {
        return param.replace(wordRegEx(words), (match) =>
          highlightReplacer(match, words)
        )
      })
    }

    // 定义接口
    interface RubyPart {
      text: string
      kana: string
      position: number
      length: number
    }

    interface ParseRuby {
      rubyParts: RubyPart[]
      outputHtml: string
    }

    // 解析函数
    const parseKata = (input: string): ParseRuby => {
      const rubyParts: RubyPart[] = []
      let output = ''
      let i = 0
      let position = 0

      while (i < input.length) {
        if (input[i] === '!') {
          // 找到汉字开始
          i++
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

    const kataTrueWordTrueCore = (
      originalText: string | undefined = '',
      words: WordItem[]
    ) => {
      const baseText = kataFalseWordFalse({ originalText })
      if (words.length === 0) return baseText

      let finalText = kataFalseWordTrue({ originalText: baseText, words })

      // 注音，['!失礼(しつれい)', '!先(さき)', '!方(かた)']
      const rubyText = originalText.match(/!([^(]+)\(([^)]+)\)/g) || []
      const kanjiKanaMarks: string[][] = []
      rubyText.forEach((item) => {
        // ['!失礼(しつれい)', '失礼', 'しつれい', index: 0, input: '!失礼(しつれい)', groups: undefined]
        const [, kanji, kana] = item.match(/!([^(]+)\(([^)]+)\)/) || []
        kanjiKanaMarks.push([kanji, kana])
      })

      const rubyRegEx =
        /(<a\b[^>]*href=["'][^"']*["'][^>]*>)|(<ruby>[^<]*<\/ruby>)|([^<]+)|(<\/a>)/g

      finalText = finalText.replace(
        rubyRegEx,
        (match, hrefPart, rubyPart, textPart, closingTag) => {
          if (hrefPart) return hrefPart
          if (rubyPart) return rubyPart
          if (closingTag) return closingTag
          if (
            textPart !== undefined &&
            textPart !== null &&
            textPart.trim() !== ''
          ) {
            kanjiKanaMarks.reverse()
            for (let i = kanjiKanaMarks.length - 1; i >= 0; i--) {
              const [kanji, kana] = kanjiKanaMarks[i];
              const originalText = textPart;
              textPart = textPart.replace(
                new RegExp(`${kanji}(?!(?:(?!<ruby>).)*<\/ruby>)`, 'i'),
                `<ruby>${kanji}<rt data-ruby="${kana}"/></ruby>`
              );
              if (textPart !== originalText) {
                // 每项只使用一次，用完就删掉
                kanjiKanaMarks.splice(i, 1);
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
    const kataTrueWordTrue = ({
      originalText = '',
      words = [],
    }: ConvertParam) => {
      return commonPreset(
        originalText,
        'katakanaTrueWordTrue',
        (param: string) => {
          return kataTrueWordTrueCore(param, words)
        }
      )
    }

    const textParser = (
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

    return {
      // 属性
      lessons,
      isLoading,
      error,
      currentIndex,
      minIndex,
      maxIndex,

      // 计算属性
      currentLesson,
      hasNext,
      hasPrevious,

      // 方法
      setCurrentIndex,
      fetchLessons,
      goPrevious,
      goNext,
      goLesson,
      textParser,
    }
  },
  {
    persist: {
      pick: ['currentIndex'],
    },
  }
)
