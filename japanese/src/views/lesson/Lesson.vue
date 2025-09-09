<template>
  <div class="lessons" v-if="hasLessons">
    <LessonHeader id="header" v-if="!fullscreen" />

    <div class="lesson-main" ref="container" @scroll="onScroll">
      <h1 id="title" class="lesson-title" ref="top">
        <el-text
          class="text-title"
          v-html="textView(lessonTitle)"
          @click="aClick"
        ></el-text>
      </h1>

      <!-- 简单句子 -->
      <section
        id="sentences"
        v-if="hasSentences"
        class="section basics-section"
      >
        <el-form class="basics-list">
          <el-form-item
            class="message"
            v-for="(item, idx) in sentences"
            :key="`basic-${idx}`"
          >
            <div class="text-row">
              <!--原文-->
              <Reading :item="item" />
              <el-text
                :id="item.textId"
                class="text text-content"
                :class="{
                  'speaking-active': activeText(item),
                }"
                v-html="textView(item.content)"
                @click="aClick"
              ></el-text>
            </div>
            <!--译文-->
            <div
              class="translation-line message"
              v-if="settingStore.basicsTranslate"
            >
              {{ item.translation }}
            </div>
          </el-form-item>
        </el-form>
      </section>

      <!-- 普通对话 -->
      <section
        id="conversations"
        v-if="hasConversations"
        class="section conversation-section"
      >
        <el-form
          v-for="(exchange, exchangeIndex) in conversations"
          :key="`exchange2-${exchangeIndex}`"
          class="conversation-exchange"
        >
          <el-form-item
            :label="message.speaker"
            class="message speaker"
            :class="[`speaker-${message.speaker}`]"
            v-for="(message, messageIndex) in exchange"
            :key="`message2-${exchangeIndex}-${messageIndex}`"
          >
            <div class="text-row">
              <!--原文-->
              <Reading :item="message" />
              <el-text
                :id="message.textId"
                class="text text-content"
                :class="{
                  'speaking-active': activeText(message),
                }"
                v-html="textView(message.content)"
                @click="aClick"
              ></el-text>
            </div>
            <!--译文-->
            <div
              class="translation-line message"
              v-if="settingStore.exchangeTranslate[exchangeIndex]"
            >
              {{ message.translation }}
            </div>
          </el-form-item>
        </el-form>
      </section>

      <!-- 情景对话 -->
      <section
        id="discussions"
        v-if="hasDiscussions"
        class="section conversation-section"
      >
        <h2>
          <el-text
            class="text text-content-h2"
            v-html="textView(discussions?.title)"
            @click="aClick"
          ></el-text>
        </h2>
        <el-form
          label-width="auto"
          v-for="(exchange, exchangeIndex) in discussions?.contents"
          :key="`exchange2-${exchangeIndex}`"
          class="conversation-exchange"
        >
          <el-form-item
            :label="displayText(message.speaker)"
            class="message speaker"
            :class="[`speaker-${message.speaker}`]"
            v-for="(message, messageIndex) in exchange"
            :key="`message2-${exchangeIndex}-${messageIndex}`"
          >
            <div class="text-row">
              <!--原文-->
              <Reading :item="message" />
              <el-text
                :id="message.textId"
                class="text text-content"
                :class="{
                  'speaking-active': activeText(message),
                }"
                v-html="textView(message.content)"
                @click="aClick"
              ></el-text>
            </div>
            <!--译文-->
            <div
              class="translation-line message"
              v-if="settingStore.exchange2Translate[exchangeIndex]"
            >
              {{ message.translation }}
            </div>
          </el-form-item>
        </el-form>
      </section>

      <!-- 短文-->
      <section id="article" v-if="hasArticle" class="section" ref="articleRef">
        <h2 class="h2">
          <Reading :item="article" :items="article?.contents" />
          <el-text
            class="text text-content-h2"
            v-html="textView(article?.title)"
            @click="aClick"
          ></el-text>
        </h2>
        <el-form class="basics-list">
          <el-form-item
            class="message"
            v-for="(item, idx) in article?.contents"
            :key="`article-${idx}`"
          >
            <div class="text-row">
              <!--原文-->
              <Reading :item="item" />
              <el-text
                :id="item.textId"
                class="text text-content article"
                :class="{
                  'speaking-active': activeText(item),
                }"
                v-html="textView(item.content)"
                @click="aClick"
              ></el-text>
            </div>
            <!--译文-->
            <div
              class="translation-line message article-translation"
              v-if="settingStore.basicsTranslate"
            >
              {{ item.translation }}
            </div>
          </el-form-item>
        </el-form>
      </section>

      <!-- 语法 -->
      <section id="grammars" class="section" ref="grammarsRef">
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

    <a class="go-top" href="#" @click="goTop">↑</a>

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
        fill="none"
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

    <IndexBar :data="indexData" />
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  type ComputedRef,
  onActivated,
  onBeforeUnmount,
  ref,
  watch,
} from 'vue'
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
import { displayText, textParser } from './index.ts'
import type { IndexItem } from '../../components/IndexBar'
import IndexBar from '../../components/IndexBar/IndexBar.vue'
import LessonAudio from './LessonAudio.vue'
import LessonHeader from './LessonHeader.vue'
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

const { fullscreen } = storeToRefs(settingStore)
const { nowTextId } = storeToRefs(readingStore)

const activeText = readingStore.activeText

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

const dialog = ref(false)

const top = ref()
const container = ref()
const grammarsRef = ref()
const articleRef = ref()
const wordsRef = ref()
const audioRef = ref()

const scrollPosition = ref<number>(0)

const lastElement = ref<HTMLElement | null>()

watch(
  () => settingStore.translate,
  (value, _) => {
    if (!value) {
      // 设置中关闭翻译功能时
      settingStore.setAllTranslate(false)
    }
  }
)

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

const scrollTarget = (
  target: any,
  config: {
    behavior?: ScrollBehavior
    block?: ScrollLogicalPosition
    inline?: ScrollLogicalPosition
  } = { behavior: 'smooth', block: 'center', inline: 'nearest' }
) => {
  const { behavior, block, inline } = config
  target?.scrollIntoView({
    behavior,
    block,
    inline,
  })
}

const aClick = (event: any) => {
  event.preventDefault()
  let target = event.target
  if (event.target.tagName.toLowerCase() === 'ruby') {
    target = event.target.parentElement
  }
  if (target.tagName.toLowerCase() === 'a') {
    const href = target.getAttribute('href')
    if (href && href.startsWith('#')) {
      const targetElement = container.value.querySelector(href)
      if (targetElement) {
        lastElement.value = target
        scrollTarget(targetElement)
        targetElement.classList.add('target-active')
        targetElement.addEventListener('animationend', () => {
          targetElement.classList.remove('target-active')
        })
      }
    }
  }
}

const words: ComputedRef<WordItem[]> = computed(() => {
  return wordStore.getByLesson(lessonStore.currentIndex)
})

const textView = computed(() => {
  return textParser(words.value, settingStore.wordLink, settingStore.furigana)
})

const goTop = () => {
  if (lastElement.value) {
    const temp = lastElement.value
    lastElement.value = null
    temp.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
    })
    temp.classList.add('target-active')
    temp.addEventListener('animationend', () => {
      temp.classList.remove('target-active')
    })
  } else {
    top.value.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
    })
  }
}

onBeforeUnmount(() => {
  speechStore.stop()
})

const onScroll = async () => {
  scrollPosition.value = container.value.scrollTop
}

interface HotkeyRef {
  [key: string]: HTMLElement | null
}

const hotkeyRefMap = computed<HotkeyRef>(() => {
  const refs: { [key: string]: HTMLElement } = {}
  const elements = [
    top.value,
    articleRef.value,
    grammarsRef.value,
    wordsRef.value,
  ] as HTMLElement[]
  elements
    .filter(Boolean)
    .map((item: HTMLElement, index: number) => {
      const key: string = `${index + 1}`
      return [key, item]
    })
    .forEach((arr) => {
      const key = arr[0] as string
      refs[key] = arr[1] as HTMLElement
    })
  return refs
})

const onSingleKeyup = (event: KeyboardEvent) => {
  if (event.ctrlKey || event.altKey || event.shiftKey || event.metaKey) {
    return
  }
  if (['ArrowLeft'].includes(event.key)) {
    lessonStore.goPrevious()
  } else if (['ArrowRight'].includes(event.key)) {
    lessonStore.goNext()
  } else if (['f'].includes(event.key)) {
    dialog.value = !dialog.value
  } else if (['r'].includes(event.key)) {
  } else if (Object.keys(hotkeyRefMap.value).includes(event.key)) {
    // 数字跳转关联键
    scrollTarget(hotkeyRefMap.value[event.key], {
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
    })
  }
}

const indexData = ref<IndexItem[]>([])
watch(
  () => hotkeyRefMap.value,
  () => {
    indexData.value = []
    Object.keys(hotkeyRefMap.value).forEach((key: string) => {
      indexData.value.push({
        label: key,
        element: hotkeyRefMap.value[key],
      })
    })
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

watch(
  () => dialog.value,
  (value, _) => {
    if (value) {
      document.removeEventListener('keyup', onSingleKeyup)
    } else {
      document.addEventListener('keyup', onSingleKeyup)
    }
  }
)
</script>

<style scoped>
.lessons {
  width: 100%;
  height: 100%;
  position: fixed;
}

.lesson-main {
  overflow-y: scroll;
  overflow-x: hidden;
  margin: 0 auto;
  width: 100vw;
  height: v-bind(mainHeight);
}

.lesson-main > * {
  max-width: var(--content-max-width);
  margin: 0 auto;
}

.lesson-title {
  margin: 10px auto 40px;
  display: flex;
  align-items: end;
  justify-content: center;
}

.lesson-switch,
.lesson-title,
.basics-section,
.conversation-section {
  padding: 0 5px;
}

.h2 {
  position: relative;
  line-height: var(--text-content-line-height);
}

.text-title {
  font-size: 1.8rem;
}

.section h2 {
  margin-bottom: 10px;
}

.text-content-h2 {
  font-size: 1.5rem;
}

.text-content {
  display: inline;
  font-size: 1.2rem;
}

.section {
  margin-bottom: 40px;
}

.translation-line {
  font-size: 0.85em;
  color: #999;
  transition: opacity 0.3s ease;
}

.text-row {
  position: relative;
  display: inline;
  align-items: center;
  letter-spacing: 1px;
  line-height: var(--text-content-line-height);
}

:deep(.anchor-link),
:deep(ruby) {
  margin: calc(0.2 * var(--gap12));
}

:deep(.anchor-link ruby),
:deep(ruby .anchor-link) {
  margin: 0;
}

:deep(.el-form-item__label-wrap) {
  align-items: start;
}

:deep(.el-form-item__label) {
  font-weight: bolder;
  color: var(--el-text-color-regular);
  user-select: none;
  white-space: nowrap;
  font-size: 1.2rem;
  line-height: var(--text-content-line-height);
}

:deep(.message .el-form-item__content) {
  display: flex;
  flex-direction: column;
  align-items: start;
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

:deep(.dict-column .cell) {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.anchor-link {
  color: inherit;
  text-decoration: none;
}

.anchor-link span {
  border-bottom: 1px dashed #1976d2;
}

.anchor-link:hover span {
  background-color: #e0f7fa;
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

.speaking-active {
  color: var(--el-color-success);
}

.speech-button {
  margin-bottom: 0.5rem;
}

.speech-button:first-child {
  margin-right: 1rem;
}

.speech-button:last-child {
  margin-left: 1rem;
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
