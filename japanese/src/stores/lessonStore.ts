import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { isNumber } from '../utils.ts'

export interface Text {
  speaker?: string
  content: string
  base?: string
  display?: string
  time: string
  translation?: string
}

export interface Lesson {
  index: number
  title?: Text
  audio: string
  basics: Text[]
  conversations: Text[][]
  title2: Text
  conversations2: Text[][]
  translation: Lesson
}

const jpJsonBase = import.meta.env.VITE_JSON_BASE

export const useLessonStore = defineStore(
  'lessons',
  () => {
    const lessons = ref<Lesson[]>([])
    const isLoading = ref(false)
    const error = ref<string | null>(null)
    const currentIndex = ref(-1)

    const minIndex = ref(0)
    const maxIndex = ref(0)

    const fetchLessons = async () => {
      try {
        isLoading.value = true
        error.value = null
        const response = await fetch(`${jpJsonBase}/lesson.json`)
        lessons.value = await response.json()
        minIndex.value = lessons.value[0].index
        maxIndex.value = lessons.value[lessons.value.length - 1].index

        currentIndex.value = minIndex.value
      } catch (err) {
        error.value =
          err instanceof Error ? err.message : 'Failed to fetch lessons'
        console.error('Error fetching lessons:', err)
      } finally {
        isLoading.value = false
      }
    }

    const isValidLesson = (index: number): boolean =>
      isNumber(index) && index >= minIndex.value && index <= maxIndex.value

    // 切换课程
    const setCurrentIndex = (index: number) => {
      if (isValidLesson(index)) {
        currentIndex.value = index
      }
    }

    const currentLesson = computed(() => {
      if (isValidLesson(currentIndex.value)) {
        return lessons.value.find((item) => item.index === currentIndex.value)
      }
    })

    const hasPrevious = computed(() => currentIndex.value > minIndex.value)

    const hasNext = computed(() => currentIndex.value < maxIndex.value)

    const goPrevious = () => {
      currentIndex.value = currentIndex.value - 1
    }

    const goNext = () => {
      currentIndex.value = currentIndex.value + 1
    }

    const goLesson = (num: number) => {
      currentIndex.value = num
    }

    return {
      // 属性
      lessons,
      isLoading,
      error,
      currentIndex,
      minIndex,
      maxIndex,

      // 计算属性
      currentLesson,
      hasNext,
      hasPrevious,

      // 方法
      setCurrentIndex,
      fetchLessons,
      goPrevious,
      goNext,
      goLesson,
    }
  },
  {
    persist: {
      pick: ['currentIndex'],
    },
  }
)
