import type { Dictionary } from '../types/dictionary'
import { placeholder } from '../constants/dictionary'

export const toUrl = (
  word: string | undefined,
  dict: Dictionary | undefined
): string | undefined => {
  if (!word || !dict || !dict.url) {
    return void 0
  }

  // 去除开头和结尾的 ~、～
  word = word.replace(/^[~～]|[~～]$/g, '')

  // // 去除词尾的 します
  // if (word.length > 3 && word.endsWith('します')) {
  //   word = word.slice(0, -3)
  // }

  // 去除词尾的 する
  if (word.length > 2 && word.endsWith('する')) {
    word = word.slice(0, -2)
  }

  return dict.url.replace(placeholder, word)
}
