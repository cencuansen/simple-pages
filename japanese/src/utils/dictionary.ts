import type { Dictionary } from '../types/dictionary'
import { placeholder } from '../constants/dictionary'

export const toUrl = (
  word: string | undefined,
  dict: Dictionary | undefined
): string | undefined => {
  if (!word || !dict || !dict.url) {
    return void 0
  }
  return dict.url.replace(placeholder, word)
}
