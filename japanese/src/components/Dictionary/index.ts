import type { Dictionary } from './types.ts'

export const placeholder: string = '{word}'

const imageUrlBase: string = import.meta.env.VITE_IMAGE_BASE

export const dictionaries: Dictionary[] = [
  {
    label: 'JD',
    name: 'JapanDict',
    url: `https://www.japandict.com/${placeholder}?lang=eng`,
    logo: `${imageUrlBase}/japan_dict.png`,
    desc: '释义、读音、活用、例句',
  },
  {
    label: 'MZ',
    name: 'Mazii',
    url: `https://mazii.net/zh-CN/search/word/jacn/${placeholder}`,
    logo: `${imageUrlBase}/mazii.png`,
    desc: '释义、读音、活用、例句',
  },
  {
    label: 'JS',
    name: 'JiSho',
    url: `https://jisho.org/search/${placeholder}`,
    logo: `${imageUrlBase}/ji_sho.png`,
    desc: '释义、例句',
  },
  {
    label: 'WL',
    name: 'Weblio',
    url: `https://www.weblio.jp/content_find/contains/0/${placeholder}`,
    logo: `${imageUrlBase}/weblio.png`,
    desc: '释义、例句',
  },
  {
    label: 'RR',
    name: 'renso-ruigo',
    url: `https://renso-ruigo.com/word/${placeholder}`,
    logo: `${imageUrlBase}/renso-ruigo.gif`,
    desc: '同义词',
  },
  {
    label: 'YD',
    name: 'YouDao',
    url: `https://youdao.com/result?word=${placeholder}&lang=ja`,
    logo: `${imageUrlBase}/you_dao.png`,
    desc: '释义、读音、例句',
  },
  {
    label: 'GT',
    name: 'Google',
    url: `https://translate.google.com/?sl=ja&tl=zh-CN&text=${placeholder}&op=translate`,
    logo: `${imageUrlBase}/google_translate.png`,
    desc: '释义、读音',
  },
  {
    label: 'BD',
    name: 'Baidu',
    url: `https://fanyi.baidu.com/mtpe-individual/transText?query=${placeholder}&lang=jp2zh`,
    logo: `${imageUrlBase}/bai_du.webp`,
    desc: '释义、读音',
  },
] as const

//

export type DictionaryName = (typeof dictionaries)[number]['name']

export const getDictionary = (str: string | undefined) => {
  if (!str) {
    return void 0
  }
  return dictionaries.find((d) => d.label === str || d.name === str)
}

export const toUrl = (
  word: string | undefined,
  dict: Dictionary | undefined
): string | undefined => {
  if (!word || !dict || !dict.url) {
    return void 0
  }
  return dict.url.replace(placeholder, word)
}
