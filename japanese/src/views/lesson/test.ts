import { kataTrueWordTrueCore } from './index.ts'
import type { WordItem } from '../../types'

const originText: string = '!運行(うんこう)の!方向(ほうこう)をへ!向(む)かう'

const words: WordItem[] = [{
  kana: 'うんこう',
  pos: '名',
  desc: '运行',
  word: '運行',
  lesson: 201,
  idx: 2197,
  group: 3
}]

kataTrueWordTrueCore(originText, words)