import { ref } from 'vue'

const emptyFn = (_1: any, _2: any, cellValue: any, _3: number) => cellValue

export const typeOptions = ['五段动词', '一段动词', '不规则动词']
export const transitivityOptions = ['他动词', '自动词', '自他动词']

export const columns = ref([
  {
    value: 'dictionary',
    label: '辞书',
    formatter: emptyFn,
    show: true,
    width: 180,
  },
  {
    value: 'hiragana',
    label: '平假名',
    formatter: emptyFn,
    show: true,
    width: 180,
  },
  {
    value: 'meaning',
    label: '释义',
    formatter: emptyFn,
    show: true,
    width: 180,
  },
  {
    value: 'type',
    label: '类型',
    formatter: emptyFn,
    show: true,
    width: 100,
  },
  {
    value: 'transitivity',
    label: '及物性',
    formatter: emptyFn,
    show: true,
    width: 80,
  },
  {
    value: 'te',
    label: 'て',
    formatter: emptyFn,
    show: true,
    width: 180,
  },
  {
    value: 'past',
    label: '过去',
    formatter: emptyFn,
    show: true,
    width: 180,
  },
  {
    value: 'negative',
    label: '否定',
    formatter: emptyFn,
    show: true,
    width: 180,
  },
  {
    value: 'negativePast',
    label: '过去否定',
    formatter: emptyFn,
    show: true,
    width: 180,
  },
  {
    value: 'polite',
    label: '丁宁',
    formatter: emptyFn,
    show: true,
    width: 180,
  },
  {
    value: 'potential',
    label: '可能',
    formatter: emptyFn,
    show: true,
    width: 180,
  },
  {
    value: 'passive',
    label: '被动',
    formatter: emptyFn,
    show: true,
    width: 180,
  },
  {
    value: 'causative',
    label: '使役',
    formatter: emptyFn,
    show: true,
    width: 180,
  },
  {
    value: 'causativePassive',
    label: '使役被动',
    formatter: emptyFn,
    show: true,
    width: 180,
  },
  {
    value: 'conditional',
    label: '条件',
    formatter: emptyFn,
    show: true,
    width: 180,
  },
  {
    value: 'imperative',
    label: '命令',
    formatter: emptyFn,
    show: true,
    width: 180,
  },
  {
    value: 'volitional',
    label: '意向',
    formatter: emptyFn,
    show: true,
    width: 180,
  },
  {
    value: 'prohibitive',
    label: '禁止',
    formatter: emptyFn,
    show: true,
    width: 180,
  },
  {
    value: 'lesson',
    label: '课程',
    formatter: emptyFn,
    show: true,
    width: 60,
  },
])
