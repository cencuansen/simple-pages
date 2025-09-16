import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import Papa from 'papaparse'
import ky from 'ky'
import { type Conju } from '@/types/verbConju.ts'

const jpJsonBase = import.meta.env.VITE_JSON_BASE

export const useJlptConjuStore = defineStore('jlpt-conju', () => {
  const jlptConjuVerbs = ref<Conju[]>([])

  const init = async () => {
    const response = await ky(`${jpJsonBase}/jlpt-verbs-conju-en.csv?t=${Date.now()}`)
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

  const allTypes = computed(() => {
    return [...new Set(jlptConjuVerbs.value.map((v: Conju) => v.type))].sort()
  })
  const allTrans = computed(() => {
    return [
      ...new Set(jlptConjuVerbs.value.map((v: Conju) => v.transitivity)),
    ].sort()
  })

  return {
    jlptConjuVerbs,
    init,
    allTypes,
    allTrans,
  }
})
