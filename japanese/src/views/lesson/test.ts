import { kataTrueWordTrueCore } from '../../utils/lesson.ts'
import type { WordItem } from '@/types/word.ts'

const originText: string = '!運行(うんこう)の!方向(ほうこう)をへ!向(む)かう'

const words: WordItem[] = []

kataTrueWordTrueCore(originText, words)
