/* src/modules/vocabulary/store/vocabulary.ts */
import {defineStore} from 'pinia';
import {computed, ref} from 'vue';
import Papa from 'papaparse';

export interface Vocabulary {
    expression: string;
    reading: string;
    meaning: string;
    tags: string;
    level: number;
    levelName: string;
}

const jpJsonBase = import.meta.env.VITE_JSON_BASE

export const useVocabularyStore = defineStore('vocabulary', () => {
    const vocabularies = ref<Vocabulary[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const currentPage = ref(1);
    const pageSize = ref(20);
    const totalInView = ref(0)
    const searchQuery = ref('');

    // 加载CSV数据
    async function loadVocabularies() {
        if (vocabularies.value.length > 0) {
            return;
        }
        loading.value = true;
        error.value = null;
        try {
            const response = await fetch(`${jpJsonBase}/jlpt-vocabularies.csv`);
            const csvText = await response.text();
            Papa.parse<Vocabulary>(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: result => {
                    vocabularies.value = dataHandler(result.data);
                },
                error: (err: any) => {
                    error.value = err.message;
                },
            });
        } catch (err) {
            error.value = 'Failed to load CSV data';
        } finally {
            loading.value = false;
        }
    }

    // 过滤和分页数据
    const doFilter = computed(() => {
        const query = searchQuery.value.toLowerCase();
        const res = vocabularies.value.filter(
            (item) =>
                item.expression.toLowerCase().includes(query) ||
                item.reading.toLowerCase().includes(query) ||
                item.meaning.toLowerCase().includes(query) ||
                item.levelName.toLowerCase().includes(query)
        );
        totalInView.value = res.length;
        return res;
    });

    const pageView = computed(() => {
        const start = (currentPage.value - 1) * pageSize.value;
        const end = start + pageSize.value;
        return doFilter.value.slice(start, end);
    });

    const totalPages = computed(() =>
        Math.ceil(doFilter.value.length / pageSize.value)
    );

    // 更新分页
    function setPage(page: number) {
        if (page >= 1 && page <= totalPages.value) {
            currentPage.value = page;
        }
    }

    // 更新搜索关键词
    function setSearchQuery(query: string) {
        searchQuery.value = query;
        currentPage.value = 1; // 重置到第一页
    }

    function dataHandler(voc: Vocabulary[]): Vocabulary[] {
        if (!voc || voc.length === 0) {
            return [];
        }
        const levelNames = [5, 4, 3, 2, 1].map(x => `jlpt_${x}`);
        for (let x = 0; x < voc.length; x++) {
            for (let i = 0; i < levelNames.length; i++) {
                if (voc[x].tags.toLowerCase().includes(levelNames[i].toLowerCase())) {
                    voc[x].level = Number(levelNames[i].split("_")[1]);
                    voc[x].levelName = levelNames[i];
                    break
                }
            }
        }
        let res: Vocabulary[] = [];
        for (let x = 0; x < levelNames.length; x++) {
            res.push(...voc.filter(item => item.levelName === levelNames[x]));
        }
        return res;
    }

    return {
        vocabularies,
        loading,
        error,
        currentPage,
        pageSize,
        searchQuery,
        doFilter,
        pageView,
        totalInView,
        loadVocabularies,
        setPage,
        setSearchQuery,
    };
});
