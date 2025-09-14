import type { Dictionary } from './types'
import { placeholder } from './constants'

export const toUrl = (
  word: string | undefined,
  dict: Dictionary | undefined
): string | undefined => {
  if (!word || !dict || !dict.url) {
    return void 0
  }
  return dict.url.replace(placeholder, word)
}
