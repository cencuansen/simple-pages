import { defineStore } from 'pinia'
import { ref } from 'vue'
import Papa from 'papaparse'
import ky from 'ky'
import type {Conju} from "../views/verbConju";

const jpJsonBase = import.meta.env.VITE_JSON_BASE

export const useJlptConjuStore = defineStore('jlpt-conju', () => {
  const jlptConjuVerbs = ref<Conju[]>([])

  const init = async () => {
    const response = await ky(`${jpJsonBase}/jlpt-verbs-conju-en.csv`)
    const csvText = await response.text()
    Papa.parse<Conju>(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (result) => {
        jlptConjuVerbs.value = result.data
      },
    })
  }

  return {
    jlptConjuVerbs,
    init,
  }
})
