import {defineStore} from 'pinia'
import {ref} from 'vue'

export interface Grammar {
    idx: number;
    lesson: number;
    content: string;
    remark: string;
    desc: string;
}

export interface GrammarFilter {
    lesson: number;
    keyword?: string;
}

const jpJsonBase = import.meta.env.VITE_JSON_BASE

export const useGrammarStore = defineStore('grammar', () => {
    const grammars = ref<Grammar[]>([])

    const fetchGrammars = async () => {
        const response = await fetch(`${jpJsonBase}/grammars.json`)
        grammars.value = await response.json()
    }

    const queryGrammars = (param: GrammarFilter) => {
        let res = grammars.value
        if (param.lesson) {
            res = res.filter(r => r.lesson === 100 + param.lesson)
        }
        if (param.keyword) {
            res = res.filter(r => r.desc.includes(param.keyword || ""))
        }
        return res
    }

    return {
        grammars,
        fetchGrammars,
        queryGrammars
    }
})
