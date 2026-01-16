import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import type { Lesson, TextBase } from '@/types/lesson.ts'
import {
  getLessonContent,
  getLessonLite,
  getLessonTranslation,
} from '@/apis/lessonApi.ts'
import { validIndex } from '@/constants/lesson.ts'
import { checkIndex, prevIndex, nextIndex } from '@/utils/lesson.ts'

export const useLessonStore = defineStore(
  'lessons',
  () => {
    const currentIndex = ref(validIndex[0])
    const lessonMap = ref<Map<number, Lesson>>(new Map())
    const contentMap = ref<Map<string, string>>(new Map())
    const translationMap = ref<Map<string, string>>(new Map())

    const init = async () => {
      lessonMap.value = await getLessonLite()
    }

    const goLesson = (num: number) => {
      currentIndex.value = checkIndex(num)
    }

    const goPrevious = () => {
      currentIndex.value = prevIndex(currentIndex.value)
    }

    const goNext = () => {
      currentIndex.value = nextIndex(currentIndex.value)
    }

    const getContent = (textId: string): string => {
      return contentMap.value.get(textId) ?? ''
    }
    const getTranslation = (textId: string): string => {
      return translationMap.value.get(textId) ?? ''
    }

    const buildContent = (textId: string): TextBase => {
      const obj = {} as TextBase
      obj.textId = textId
      obj.ttsAudio = `/${currentIndex.value}/${textId}.mp3`
      obj.content = contentMap.value.get(textId) ?? ''
      return obj
    }

    const currentLesson = computed(() =>
      lessonMap.value.get(currentIndex.value)
    )

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

    const lessonAudio = computed(() => `/${currentIndex.value}.mp3`)

    watch(
      () => currentIndex.value,
      async (value) => {
        contentMap.value = await getLessonContent(value)
        translationMap.value = await getLessonTranslation(value)
      }
    )

    return {
      init,
      goLesson,
      goPrevious,
      goNext,
      getContent,
      getTranslation,
      buildContent,

      currentLesson,
      lessonTitle,
      hasSentences,
      sentences,
      hasDiscussions,
      discussions,
      hasConversations,
      conversations,
      hasArticle,
      article,
      lessonAudio,
      currentIndex,
    }
  },
  {
    persist: {
      pick: ['currentIndex'],
    },
  }
)
