import { kataTrueWordTrueCore } from './index.ts'
import type { WordItem } from '../../types'

const originText: string = '!運行(うんこう)の!方向(ほうこう)をへ!向(む)かう'

const words: WordItem[] = []

kataTrueWordTrueCore(originText, words)
