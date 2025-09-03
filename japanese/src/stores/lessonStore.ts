import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { isNumber } from '../utils'
import type { Lesson } from '../views/lesson/types.ts'
import ky from 'ky'

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

    // 获取课程数据
    const fetchLessons = async () => {
      try {
        isLoading.value = true
        error.value = null
        const response = await ky(`${jpJsonBase}/lesson.json`)
        lessons.value = await response.json()
        minIndex.value = lessons.value[0].index
        maxIndex.value = lessons.value[lessons.value.length - 1].index

        if (!isValidLessonIndex(currentIndex.value)) {
          currentIndex.value = minIndex.value
        }
      } catch (err) {
        error.value =
          err instanceof Error ? err.message : 'Failed to fetch lessons'
        console.error('Error fetching lessons:', err)
      } finally {
        isLoading.value = false
      }
    }

    // 检查课程索引是否有效
    const isValidLessonIndex = (index: number): boolean =>
      isNumber(index) && index >= minIndex.value && index <= maxIndex.value

    // 切换课程
    const setCurrentIndex = (index: number) => {
      isValidLessonIndex(index) && (currentIndex.value = index)
    }

    const currentLesson = computed(() =>
      lessons.value.find((item) => item.index === currentIndex.value)
    )

    // 全部课程号
    const lessonIndexs = computed(() => lessons.value.map((les) => les.index))

    const hasPrevious = computed(() => {
      const position = lessonIndexs.value.indexOf(currentIndex.value)
      return Boolean(lessonIndexs.value[position - 1])
    })

    const hasNext = computed(() => {
      const position = lessonIndexs.value.indexOf(currentIndex.value)
      return Boolean(lessonIndexs.value[position + 1])
    })

    const goPrevious = () => {
      const position = lessonIndexs.value.indexOf(currentIndex.value)
      const value = lessonIndexs.value[position - 1]
      Boolean(value) && (currentIndex.value = value)
    }

    const goNext = () => {
      const position = lessonIndexs.value.indexOf(currentIndex.value)
      const value = lessonIndexs.value[position + 1]
      Boolean(value) && (currentIndex.value = value)
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
