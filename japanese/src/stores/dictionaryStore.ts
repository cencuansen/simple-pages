import { defineStore } from 'pinia'
import type { Dictionary } from '../components/Dictionary/types.ts'
import { ref } from 'vue'
import { dictionaries } from '@/components/Dictionary/constants.ts'

export const useDictionaryStore = defineStore('dictionary', () => {
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



  return {
    dictionary,
    dictionaries,
    getOne,
    setOne,
  }
})
