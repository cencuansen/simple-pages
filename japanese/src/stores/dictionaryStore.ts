import { defineStore } from 'pinia'
import type { Dictionary } from '../types/dictionary'
import { ref } from 'vue'
import { dictionaries as dicts } from '@/constants/dictionary'

export const useDictionaryStore = defineStore('dictionary', () => {
  const dictionaries = ref(dicts)
  const dictionary = ref<Dictionary>(dicts[0])

  const getOne = (name: string | undefined = ''): Dictionary => {
    if (!name) {
      return dictionaries.value[0]
    }
    let dict = dictionaries.value.find(
      (dict) => dict.name === name || dict.label === name
    )
    return dict || dictionaries.value[0]
  }

  const setOne = (name: string | undefined) => {
    dictionary.value = getOne(name)
  }

  return {
    dictionary,
    dictionaries,
    getOne,
    setOne,
  }
})
