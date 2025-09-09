<template>
  <div class="lessons" v-if="hasLessons">
    <LessonHeader id="header" v-if="!fullscreen" />

    <div class="lesson-main" ref="container" @scrollend="onScrollEnd">
      <section class="section">
        <h1 id="title" ref="top" v-html="textView(lessonTitle)"></h1>
      </section>

      <!-- 简单句子 -->
      <section id="sentences" class="section" v-if="hasSentences">
        <el-form>
          <LessonRow
            :container="container"
            :rows="sentences"
            :words="words"
            :translate="allTranslate"
          />
        </el-form>
      </section>

      <!-- 普通对话 -->
      <section id="conversations" class="section" v-if="hasConversations">
        <el-form v-for="exchange in conversations">
          <LessonRow
            :container="container"
            :rows="exchange"
            :words="words"
            :translate="allTranslate"
          />
        </el-form>
      </section>

      <!-- 情景对话 -->
      <section id="discussions" class="section" v-if="hasDiscussions">
        <h2 v-html="textView(discussions?.title)" @click="aClick"></h2>
        <el-form label-width="auto" v-for="exchange in discussions?.contents">
          <LessonRow
            :container="container"
            :rows="exchange"
            :words="words"
            :translate="allTranslate"
          />
        </el-form>
      </section>

      <!-- 短文-->
      <section id="article" class="section" v-if="hasArticle">
        <h2>
          <Reading :item="article" :items="article?.contents" />
          <span v-html="textView(article?.title)" @click="aClick"></span>
        </h2>
        <el-form>
          <LessonRow
            :container="container"
            :rows="article?.contents"
            :words="words"
            :translate="allTranslate"
          />
        </el-form>
      </section>

      <!-- 语法 -->
      <section id="grammars" class="section">
        <GrammarCore :data="grammars" :lesson-index="currentIndex" />
      </section>

      <!-- 单词 -->
      <section id="words" class="section" ref="wordsRef">
        <WordCore :data="wordList" :lesson-index="currentIndex" show-header />
      </section>
    </div>

    <LessonAudio ref="audioRef" />

    <el-dialog
      class="search-model"
      v-model="dialog"
      v-if="dialog"
      :modal="true"
    >
      <template #header>
        <el-input
          v-model.lazy="keyword"
          size="small"
          placeholder="搜索"
          clearable
          v-focus
        />
      </template>
      <div class="model-result-item" v-for="lesson in fullLessons">
        <div
          class="model-lesson-title"
          v-html="displayText(lesson.title)"
          @click="goLesson(Number(lesson.idx))"
        ></div>
        <div
          class="model-lesson-match-content"
          v-for="content in lesson.contents"
          v-html="content"
        ></div>
      </div>
    </el-dialog>

    <a class="go-top" href="#" @click="goTop(top)">↑</a>

    <div
      class="close-fullscreen"
      title="退出全屏"
      v-if="fullscreen"
      @click="toggleFullscreen(false)"
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
import { computed, type ComputedRef, onActivated, ref, watch } from 'vue'
import { useLessonStore } from '../../stores/lessonStore.ts'
import { useReadingStore } from '../../stores/readingStore.ts'
import { useSpeechStore } from '../../stores/speechStore.ts'
import { useAudioStore } from '../../stores/audioStore.ts'
import { useSettingStore } from '../../stores/settingStore.ts'
import { useWordStore } from '../../stores/wordStore.ts'
import { useGrammarStore } from '../../stores/grammar/grammarStore.ts'
import type { WordItem } from '../../types'
import { searchLesson } from '../../utils'
import { storeToRefs } from 'pinia'
import { onDeactivated } from '@vue/runtime-core'
import { useRouter } from 'vue-router'
import { displayText, textParser, aClick, goTop } from './index.ts'
import IndexBar from '../../components/IndexBar/IndexBar.vue'
import LessonAudio from './LessonAudio.vue'
import LessonHeader from './LessonHeader.vue'
import LessonRow from './LessonRow.vue'
import Reading from '../../components/Reading.vue'
import WordCore from '../word/WordCore.vue'
import GrammarCore from '../grammar/GrammarCore.vue'

const lessonStore = useLessonStore()
const readingStore = useReadingStore()
const speechStore = useSpeechStore()
const audioStore = useAudioStore()
const wordStore = useWordStore()
const settingStore = useSettingStore()
const grammarStore = useGrammarStore()

const { wordList } = storeToRefs(wordStore)
const { grammars } = storeToRefs(grammarStore)

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
} = storeToRefs(lessonStore)
const goLesson = lessonStore.goLesson
const setDialog = lessonStore.setDialog

const { fullscreen, allTranslate } = storeToRefs(settingStore)
const { nowTextId } = storeToRefs(readingStore)

const { isPlaying } = storeToRefs(audioStore)

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
const container = ref()
const scrollPosition = ref<number>(0)

watch(
  () => speechStore.lastFireTime,
  (_) => {
    document.getElementById(nowTextId.value)?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
    })
  }
)

const keyword = ref('')
const fullLessons = computed(() => searchLesson(lessons.value, keyword.value))

const toggleFullscreen = (newStatus: boolean | null = null) => {
  settingStore.setFullscreen(newStatus !== null ? newStatus : !fullscreen.value)
}

const mainHeight = computed(() => {
  if (fullscreen.value) {
    // 全屏
    return `calc(100vh - var(--root-footer-height))`
  } else if (!isPlaying.value) {
    // 非全屏 && 没有启用音频播放
    return `calc(100vh - var(--root-header-height) - var(--lesson-headers-height) - var(--root-footer-height))`
  } else {
    return `calc(100vh - var(--root-header-height) - var(--lesson-headers-height) - var(--audio-height) - var(--root-footer-height))`
  }
})

const words: ComputedRef<WordItem[]> = computed(() => {
  return wordStore.getByLesson(lessonStore.currentIndex)
})

const textView = computed(() => {
  return textParser(words.value, settingStore.wordLink, settingStore.furigana)
})

const onScrollEnd = async () => {
  scrollPosition.value = container.value.scrollTop
}

const onSingleKeyup = (event: KeyboardEvent) => {
  if (event.ctrlKey || event.altKey || event.shiftKey || event.metaKey) {
    return
  }
  if (['ArrowLeft'].includes(event.key)) {
    lessonStore.goPrevious()
  } else if (['ArrowRight'].includes(event.key)) {
    lessonStore.goNext()
  } else if (['f'].includes(event.key)) {
    setDialog(!dialog.value)
  } else if (['r'].includes(event.key)) {
  }
}

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
  margin: 10px auto 10px;
  max-width: var(--content-max-width);
}

:deep(.anchor-link),
:deep(ruby) {
  margin: calc(0.2 * var(--gap12));
}

:deep(.anchor-link ruby),
:deep(ruby .anchor-link) {
  margin: 0;
}

:deep(.target-active) {
  animation: highlight 3s ease-in-out alternate;
}

@keyframes highlight {
  0%,
  20%,
  40%,
  60%,
  80% {
    color: #ff0000;
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    color: #ff9900;
  }
  100% {
    color: inherit;
  }
}

:deep(.el-scrollbar__wrap) {
  /* 解决移动端滚动不顺畅问题 */
  overflow-y: hidden;
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
  font-size: 16px;
}

.model-lesson-title {
  cursor: pointer;
  font-weight: bolder;
  margin-bottom: 5px;
}

.model-lesson-title:hover {
  color: #1976d2;
}

.model-lesson-match-content {
  user-select: auto;
  box-sizing: border-box;
  padding-left: 20px;
}

.go-top {
  position: absolute;
  bottom: 100px;
  right: 50px;
  width: 12px;
  height: 12px;
  border: none;
  border-radius: 50%;
  line-height: 25px;
  text-align: center;
  user-select: none;
  z-index: 999;
  color-scheme: inherit;
  font-weight: bolder;
  font-size: 1.5rem;
  color: var(--el-color-primary);
  background-color: inherit;
  backdrop-filter: blur(10000px);
  text-decoration: none;
}

@media (min-width: 700px) {
  .go-top {
    right: calc((100vw - var(--content-max-width)) * 0.25);
  }
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
  display: flex; /* 使用Flexbox */
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  backdrop-filter: blur(10000px);
}
</style>
