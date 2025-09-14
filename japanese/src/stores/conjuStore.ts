import { defineStore } from 'pinia'
import { ref } from 'vue'
import Papa from 'papaparse'
import ky from 'ky'
import type { Conju } from '@/views/verbConju'

const jpJsonBase = import.meta.env.VITE_JSON_BASE

export const useConjuStore = defineStore('conju', () => {
  const conjuVerbs = ref<Conju[]>([])

  const init = async () => {
    const response = await ky(`${jpJsonBase}/verbs-conju.csv`)
    const csvText = await response.text()
    Papa.parse<Conju>(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (result) => {
        conjuVerbs.value = result.data
      },
    })
  }

  return {
    conjuVerbs,
    init,
  }
})
