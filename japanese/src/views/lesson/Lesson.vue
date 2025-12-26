<template>
  <div class="lessons" v-if="hasLessons">
    <div class="lesson-main" ref="container" @scrollend="onScrollEnd">
      <div ref="top"></div>

      <LessonHeader id="header" v-if="!fullscreen" />

      <section class="section">
        <el-text>
          <h1 id="title" v-html="textView(lessonTitle)"></h1>
        </el-text>
      </section>

      <!-- 简单句子 -->
      <section id="sentences" class="section" v-if="hasSentences">
        <LessonRow
          :rows="sentences"
          :translate="allTranslate"
          :text-view="textView"
        />
      </section>

      <!-- 普通对话 -->
      <section id="conversations" class="section" v-if="hasConversations">
        <el-form v-for="exchange in conversations">
          <LessonRow
            :rows="exchange"
            :translate="allTranslate"
            :text-view="textView"
          />
        </el-form>
      </section>

      <!-- 情景对话 -->
      <section id="discussions" class="section" v-if="hasDiscussions">
        <el-text>
          <h2 v-html="textView(discussions?.title)"></h2>
        </el-text>
        <div class="discussions" v-for="exchange in discussions?.contents">
          <LessonRow
            :rows="exchange"
            :translate="allTranslate"
            :text-view="textView"
          />
        </div>
      </section>

      <!-- 短文-->
      <section id="article" class="section" v-if="hasArticle">
        <div class="article-title">
          <Reading :row-items="article?.contents as TextBase[]" />
          <el-text>
            <h2 v-html="textView(article?.title)"></h2>
          </el-text>
        </div>

        <el-form>
          <LessonRow
            :rows="article?.contents"
            :translate="allTranslate"
            :text-view="textView"
          />
        </el-form>
      </section>

      <!-- 语法 -->
      <section id="grammars" class="section">
        <GrammarCore
          :data="grammars"
          function-group
          keyword-filter
          pagination
        />
      </section>

      <!-- 单词 -->
      <section id="words" class="section" ref="wordsRef">
        <el-tag v-if="activeWord" closable @close="setActiveWord(null)">
          正在查看单词：{{ activeWord?.word }}
        </el-tag>
        <WordCore
          :data="words"
          :active-word="activeWord"
          :lesson-index="currentIndex"
          show-header
          pagination
        />
      </section>

      <div ref="end"></div>
    </div>

    <LessonAudio ref="audioRef" />

    <el-dialog
      class="search-model"
      v-model="dialog"
      v-if="dialog"
      :modal="true"
    >
      <template #header>
        <SimpleInput v-model.lazy="keyword" v-focus />
      </template>
      <div class="model-result-item" v-for="lesson in fullLessons">
        <div
          class="model-lesson-title"
          v-html="displayText(lesson.title)"
          @click="goLessonContent(Number(lesson.idx))"
        ></div>
        <div
          class="model-lesson-match-content"
          v-for="content in lesson.contents"
          v-html="content.text"
          @click="goLessonContent(Number(lesson.idx), content.textId)"
        ></div>
      </div>
    </el-dialog>

    <LinkTo :container="container" :bind="['.anchor-link']" />

    <div
      class="close-fullscreen"
      title="退出全屏"
      v-if="fullscreen"
      @click="toggleFullscreen"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M18 6L6 18M6 6L18 18"
          stroke="white"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
    </div>

    <IndexBar bind=".lesson-main" />
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  type ComputedRef,
  nextTick,
  onActivated,
  ref,
  watch,
} from 'vue'
import { useReadingStore } from '@/stores/readingStore.ts'
import { useLessonStore } from '@/stores/lessonStore.ts'
import { useAudioStore } from '@/stores/audioStore.ts'
import { useSpeechStore } from '@/stores/speechStore.ts'
import { useSettingStore } from '@/stores/settingStore.ts'
import { useWordStore } from '@/stores/wordStore.ts'
import { useGrammarStore } from '@/stores/grammar/grammarStore.ts'
import type { WordItem } from '@/types/word.ts'
import { searchLesson, displayText, textParser } from '@/utils/lesson.ts'
import { storeToRefs } from 'pinia'
import { onDeactivated } from '@vue/runtime-core'
import { useRouter } from 'vue-router'
import { scrollToEle, scrollToId } from '@/utils/common'
import IndexBar from '../../components/IndexBar/IndexBar.vue'
import LinkTo from '../../components/LinkTo/LinkTo.vue'
import LessonAudio from './LessonAudio.vue'
import LessonHeader from './LessonHeader.vue'
import LessonRow from './LessonRow.vue'
import Reading from '../../components/Reading.vue'
import WordCore from '../word/WordCore.vue'
import GrammarCore from '../grammar/GrammarCore.vue'
import SimpleInput from '../../components/SimpleInput.vue'
import type { TextBase } from '../../types/lesson.ts'

const readingStore = useReadingStore()
const lessonStore = useLessonStore()
const audioStore = useAudioStore()
const speechStore = useSpeechStore()
const settingStore = useSettingStore()
const grammarStore = useGrammarStore()
const wordStore = useWordStore()

const setNowTextId = readingStore.setNowTextId

const {
  dialog,
  currentIndex,
  currentLesson,
  lessons,
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
  activeWord,
  lessonAudio,
} = storeToRefs(lessonStore)
const { goLesson, setDialog, setActiveWord } = lessonStore

const { fullscreen, allTranslate, wordLink, furigana } =
  storeToRefs(settingStore)
const toggleTranslate = settingStore.toggleTranslate
const furiganaToggle = settingStore.furiganaToggle
const wordLinkToggle = settingStore.wordLinkToggle
const toggleFullscreen = settingStore.toggleFullscreen

const { isPlaying } = storeToRefs(audioStore)
const playAudio = audioStore.playAudio
const pauseAudio = audioStore.pauseAudio

const stopSpeech = speechStore.stop

const props = defineProps(['index'])
const router = useRouter()

if (props.index) {
  const index = Number(props.index)
  lessonStore.goLesson(index)
}

watch(
  () => currentLesson.value,
  (_) => {
    let index = currentLesson.value?.index
    router.push(`/lesson/${index}`)
  }
)

const top = ref()
const end = ref()
const container = ref()
const scrollPosition = ref<number>(0)

const keyword = ref('')
const fullLessons = computed(() => searchLesson(lessons.value, keyword.value))

const mainHeight = computed(() => {
  if (fullscreen.value) {
    // 全屏
    return `calc(100vh - var(--root-footer-height))`
  } else if (!isPlaying.value) {
    // 非全屏 && 没有启用音频播放
    return `calc(100vh - var(--root-header-height) - var(--root-footer-height))`
  } else {
    // return `calc(100vh - var(--root-header-height) - var(--lesson-headers-height) - var(--audio-height) - var(--root-footer-height))`
    return `calc(100vh - var(--root-header-height) - var(--root-footer-height))`
  }
})

const words: ComputedRef<WordItem[]> = computed(() => {
  return wordStore.wordList
})

const grammars = computed(() => {
  return grammarStore.queryGrammars({ lesson: currentIndex.value })
})

const textView = computed(() => {
  return textParser(wordLink.value, furigana.value)
})

const onScrollEnd = async () => {
  scrollPosition.value = container.value.scrollTop
}

const goLessonContent = async (lessonIndex: number, textId: string = '') => {
  goLesson(lessonIndex)
  await nextTick()
  if (textId) {
    scrollToId(textId)
    setNowTextId(textId)
  } else {
    scrollToEle(top.value)
  }
}

const onSingleKeyup = (event: KeyboardEvent) => {
  if (event.ctrlKey || event.altKey || event.shiftKey || event.metaKey) {
    return
  }
  if (['ArrowLeft'].includes(event.key)) {
    lessonStore.goPrevious()
  } else if (['ArrowRight'].includes(event.key)) {
    lessonStore.goNext()
  } else if (['s'].includes(event.key)) {
    setDialog(!dialog.value)
  } else if (['t'].includes(event.key)) {
    toggleTranslate()
  } else if (['h'].includes(event.key)) {
    furiganaToggle()
  } else if (['w'].includes(event.key)) {
    wordLinkToggle()
  } else if (['f'].includes(event.key)) {
    toggleFullscreen()
  } else if (['p'].includes(event.key)) {
    if (isPlaying.value) {
      stopSpeech()
      pauseAudio()
    } else {
      playAudio({ id: lessonAudio.value || '', text: lessonAudio.value || '' })
    }
  }
}

watch(
  () => dialog.value,
  () => {
    if (dialog.value) {
      document.removeEventListener('keyup', onSingleKeyup)
    } else {
      document.addEventListener('keyup', onSingleKeyup)
    }
  }
)

// 刷新页面、切换页面 router.push 是否执行。
// 避免刷新页面执行 onActivated 中 router.push，此时 index 为 undefined。
let deactivated = false

onActivated(async () => {
  deactivated &&
    (await router.push(`/lesson/${lessonStore?.currentLesson?.index}`))

  document.addEventListener('keyup', onSingleKeyup)
  setTimeout(() => {
    if (container && container.value) {
      container.value.scrollTop = scrollPosition.value
    }
  })
})

onDeactivated(() => {
  deactivated = true
  document.removeEventListener('keyup', onSingleKeyup)
})
</script>

<style scoped>
.lessons {
  width: 100%;
  height: 100%;
  position: fixed;
}

.lesson-main {
  overflow-x: hidden;
  width: 100vw;
  height: v-bind(mainHeight);
}

.section {
  margin: 0 auto 10px;
  max-width: var(--content-max-width);
}

h1 {
  font-size: 3rem;
  margin-bottom: 12px;
}

h2 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  display: flex;
  align-items: baseline;
}

.article-title {
  display: flex;
  align-items: center;
}

:deep(.anchor-link) {
  word-break: break-word;
}

:deep(.el-table .el-scrollbar__wrap) {
  /* 解决移动端滚动不顺畅问题 */
  overflow-y: hidden;
}

:deep(section .row),
:deep(section .simple-pagination) {
  overflow: hidden;
}

:deep(.search-model) {
  width: 95%;
  max-width: calc(var(--content-max-width) * 1.1);
}

:deep(.el-dialog__body) {
  height: 60vh;
  overflow-y: auto;
}

.model-result-item {
  margin: 30px 20px;
  font-size: 1.6rem;
}

.model-lesson-title {
  margin-bottom: 5px;
}

.model-lesson-title:hover,
.model-lesson-match-content:hover {
  cursor: pointer;
  color: var(--el-color-primary);
}

.model-lesson-match-content {
  user-select: text;
  box-sizing: border-box;
  padding-left: 20px;
}

.close-fullscreen {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: red;
  position: absolute;
  top: 10px;
  right: 15px;
  cursor: pointer;
  font-size: 24px;
  user-select: none;
  z-index: 999;
  display: flex;
  /* 使用Flexbox */
  justify-content: center;
  /* 水平居中 */
  align-items: center;
  /* 垂直居中 */
  backdrop-filter: blur(10000px);
}
</style>
