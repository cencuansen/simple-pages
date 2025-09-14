import { defineStore } from 'pinia'
import type { Dictionary } from '../components/Dictionary/types.ts'
import { ref } from 'vue'

export const placeholder: string = '{word}'

const imageUrlBase: string = import.meta.env.VITE_IMAGE_BASE

export const useDictionaryStore = defineStore('dictionary', () => {
  const dictionaries: Dictionary[] = [
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
  ]

  const dictionary = ref<Dictionary>(dictionaries[0])

  const getOne = (name: string | undefined = ''): Dictionary => {
    if (!name) {
      return dictionaries[0]
    }
    let dict = dictionaries.find(
      (dict) => dict.name === name || dict.label === name
    )
    return dict || dictionaries[0]
  }

  const setOne = (name: string | undefined) => {
    dictionary.value = getOne(name)
  }

  const toUrl = (
    word: string | undefined,
    dict: Dictionary | undefined
  ): string | undefined => {
    if (!word || !dict || !dict.url) {
      return void 0
    }
    return dict.url.replace(placeholder, word)
  }

  return {
    dictionary,
    dictionaries,
    toUrl,
    getOne,
    setOne
  }
})
