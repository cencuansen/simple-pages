import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { isNumber } from '../utils'
import type { Lesson } from '../views/lesson/types.ts'
import ky from 'ky'
import type { ActiveWord } from '../types/index.ts'

const jpJsonBase = import.meta.env.VITE_JSON_BASE

export const useLessonStore = defineStore(
  'lessons',
  () => {
    // props
    const lessons = ref<Lesson[]>([])
    const isLoading = ref(false)
    const error = ref<string | null>(null)
    const currentIndex = ref(-1)
    const minIndex = ref(0)
    const maxIndex = ref(0)
    const dialog = ref(false)
    const lastElement = ref<HTMLElement | null>()
    const activeWord = ref<ActiveWord | null>(null)

    // 初始化
    const init = async () => {
      try {
        isLoading.value = true
        error.value = null
        const response = await ky(`${jpJsonBase}/lesson.json`)
        const data: Lesson[] = await response.json()
        process(data)
        lessons.value = data
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

    // -- private functions start --
    // 检查课程索引是否有效
    const isValidLessonIndex = (index: number): boolean =>
      isNumber(index) && index >= minIndex.value && index <= maxIndex.value

    const process = (data: Lesson[]) => {
      if (!data || data.length === 0) {
        return []
      }
      return data
    }
    // -- private functions end --

    // -- setters start --
    // 切换课程
    const setCurrentIndex = (index: number) => {
      isValidLessonIndex(index) && (currentIndex.value = index)
    }

    const setDialog = (val: boolean): void => {
      dialog.value = val
    }

    const setLastElement = (el: HTMLElement | null): void => {
      lastElement.value = el
    }

    const setActiveWord = (word: ActiveWord | null): void => {
      activeWord.value = word
    }
    // -- setters end --

    // -- computed props start --
    const currentLesson = computed(() =>
      lessons.value.find((item) => item.index === currentIndex.value)
    )
    const hasLessons = computed(() => Boolean(currentLesson.value))

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

    const lessonTitle = computed(() => currentLesson.value?.title)

    const hasSentences = computed(() => {
      if (currentLesson.value) {
        return currentLesson.value.sentences.length > 0
      }
      return false
    })
    const sentences = computed(() => currentLesson.value?.sentences)

    const hasConversations = computed(() => {
      if (currentLesson.value) {
        return currentLesson.value.sentences.length > 0
      }
      return false
    })
    const conversations = computed(() => currentLesson.value?.conversations)

    const hasDiscussions = computed(() => {
      if (currentLesson.value && currentLesson.value.discussions) {
        return currentLesson.value.discussions.contents.length > 0
      }
      return false
    })
    const discussions = computed(() => {
      return currentLesson.value?.discussions
    })

    const hasArticle = computed(() => {
      if (currentLesson.value && currentLesson.value.article) {
        return currentLesson.value.article.contents.length > 0
      }
      return false
    })
    const article = computed(() => currentLesson.value?.article)

    const hasAudio = computed(() => {
      return currentLesson.value && Boolean(currentLesson.value.audio)
    })
    const lessonAudio = computed(() => currentLesson.value?.audio)
    // -- computed props end --

    // -- functions start --
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
    // -- functions end --

    return {
      // 属性
      lessons,
      isLoading,
      error,
      currentIndex,
      minIndex,
      maxIndex,
      dialog,
      lastElement,
      activeWord,

      // 计算属性
      currentLesson,
      hasNext,
      hasPrevious,
      hasLessons,
      lessonTitle,
      hasSentences,
      sentences,
      hasDiscussions,
      discussions,
      hasConversations,
      conversations,
      hasArticle,
      article,
      hasAudio,
      lessonAudio,

      // setter
      setCurrentIndex,
      setDialog,
      setLastElement,
      setActiveWord,

      // 方法
      init,
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
