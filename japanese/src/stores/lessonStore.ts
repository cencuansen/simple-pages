import {defineStore} from 'pinia'
import {computed, ref, watch} from 'vue'

export interface Conversations {
    speaker: string;
    content: string;
}

export interface Lesson {
    title?: string
    basics: string[],
    conversations: Conversations[][],
    title2: string,
    conversations2: Conversations[][],
    translation: Lesson
}

export const useLessonStore = defineStore('lessons', () => {
    const lessons = ref<Lesson[]>([])
    const isLoading = ref(false)
    const error = ref<string | null>(null)
    const currentIndex = ref(0)

    const fetchLessons = async () => {
        try {
            isLoading.value = true
            error.value = null
            const response = await fetch('/lesson.json')
            lessons.value = await response.json()
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to fetch lessons'
            console.error('Error fetching lessons:', err)
        } finally {
            isLoading.value = false
        }
    }

    // 切换课程
    const setCurrentIndex = (index: number) => {
        if (index >= 0 && index < lessons.value.length) {
            currentIndex.value = index
        }
    }

    watch(currentIndex, (newVal) => {
        document.title = `第 ${newVal + 1} 课 - 新版标准日本语`
    })

    return {
        lessons,
        isLoading,
        error,
        currentIndex,
        setCurrentIndex,
        fetchLessons,
        // 计算属性
        currentLesson: computed(() => lessons.value[currentIndex.value]),
        hasNext: computed(() => currentIndex.value < lessons.value.length - 1),
        hasPrevious: computed(() => currentIndex.value > 0)
    }
}, {
    persist: {
        pick: ["currentIndex"]
    }
})