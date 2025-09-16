export interface Conju {
  [key: string]: any // 添加索引签名
  textId: string // 唯一ID
  dictionary: string // 辞书
  hiragana: string // 平假名
  meaning: string // 释义
  type: string // 类型
  transitivity: string // 及物性
  negative: string // 否定
  polite: string // 丁寧
  conditional: string // 条件
  volitional: string // 意向
  te: string // て
  past: string // 過去
  negativePast: string // 過去否定
  passive: string // 被动
  causative: string // 使役
  potential: string // 可能
  imperative: string // 命令
  lesson: number // 课程号
}

export interface VerbConjuColumn {
  value: string
  label: string
  formatter?: (_1: any, _2: any, cellValue: any, _3: number) => any
  show?: boolean
  width?: number
}
