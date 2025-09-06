<template>
  <div class="lessons" v-if="currentLesson">
    <div id="header" class="lesson-headers" v-if="!fullscreen">
      <div class="lesson-switch">
        <el-button
          size="small"
          class="previous-button navigation-item"
          :disabled="!lessonStore.hasPrevious"
          @click="lessonStore.goPrevious"
        >
          上一课
        </el-button>
        <LessonSelect v-model="lessonStore.currentIndex" :clearable="false" />
        <el-button
          size="small"
          class="next-button navigation-item"
          :disabled="!lessonStore.hasNext"
          @click="lessonStore.goNext"
        >
          下一课
        </el-button>
      </div>
      <div class="function-group">
        <el-button
          :type="settingStore.allTranslate ? 'primary' : ''"
          size="small"
          circle
          title="翻译"
          v-if="settingStore.translate"
          @click="settingStore.setAllTranslate(!settingStore.allTranslate)"
        >
          译
        </el-button>
        <el-button
          :type="settingStore.furigana ? 'primary' : ''"
          size="small"
          circle
          title="注音"
          @click="settingStore.furiganaToggle"
        >
          注
        </el-button>
        <el-button
          :type="settingStore.wordLink ? 'primary' : ''"
          size="small"
          circle
          title="单词跳转"
          @click="settingStore.wordLinkToggle"
        >
          跳
        </el-button>
        <el-button
          :type="''"
          size="small"
          circle
          title="搜索"
          @click="dialog = !dialog"
        >
          搜
        </el-button>
        <el-button
          size="small"
          circle
          title="全屏"
          v-if="!fullscreen"
          @click="toggleFullscreen"
        >
          全
        </el-button>
        <el-button
          :type="''"
          size="small"
          circle
          title="播放"
          :disabled="isPlaying"
          v-if="currentLesson?.audio && settingStore.audioSpeak"
          @click="playAudio(``, speechStore.repeatTimes)"
        >
          读
        </el-button>
        <el-button
          :type="''"
          size="small"
          circle
          v-if="isPlaying"
          title="停止播放"
          @click="pauseAudio"
        >
          停
        </el-button>
      </div>
    </div>

    <div class="lesson-main" ref="container" @scroll="onScroll">
      <div ref="top"></div>
      <h1 id="title" class="lesson-title">
        <el-text
          class="text-title"
          v-html="textView(currentLesson.title)"
          @click="aClick"
        ></el-text>
      </h1>

      <!-- 简单句子 -->
      <section
        id="sentences"
        v-if="currentLesson?.sentences?.length"
        class="section basics-section"
      >
        <el-form class="basics-list">
          <el-form-item
            class="message"
            v-for="(item, idx) in currentLesson?.sentences"
            :key="`basic-${idx}`"
          >
            <div class="text-row">
              <!--原文-->
              <el-button
                class="speech-button"
                :disabled="isPlaying"
                circle
                size="small"
                v-if="item.time && settingStore.audioSpeak"
                @click="playAudio(item.time, speechStore.repeatTimes)"
              >
                <el-icon>
                  <i class="icon-on-music"></i>
                </el-icon>
              </el-button>
              <el-button
                class="speech-button"
                circle
                size="small"
                v-else-if="settingStore.ttsSpeak"
                :disabled="isPlaying"
                @click="speechStore.speak(speakText(item.content))"
              >
                <i class="icon-on-MPIS-TTS"></i>
              </el-button>
              <el-text
                :id="speakingTextId(speakText(item.content))"
                class="text text-content"
                :class="{
                  'speaking-active': speakingActive(
                    item.time,
                    currentTime,
                    speakText(item.content)
                  ),
                }"
                v-html="textView(item.content)"
                @click="aClick"
              ></el-text>
            </div>
            <!--译文-->
            <div
              class="translation-line message"
              :class="{ 'show-translation': settingStore.basicsTranslate }"
            >
              {{ item.translation }}
            </div>
          </el-form-item>
        </el-form>
      </section>

      <!-- 普通对话 -->
      <section
        id="conversations"
        v-if="currentLesson?.conversations?.length"
        class="section conversation-section"
      >
        <el-form
          v-for="(exchange, exchangeIndex) in currentLesson?.conversations"
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
              <el-button
                class="speech-button"
                size="small"
                circle
                :disabled="isPlaying"
                v-if="message.time && settingStore.audioSpeak"
                @click="playAudio(message.time, speechStore.repeatTimes)"
              >
                <el-icon>
                  <i class="icon-on-music"></i>
                </el-icon>
              </el-button>
              <el-button
                class="speech-button"
                v-else-if="settingStore.ttsSpeak"
                circle
                size="small"
                :disabled="isPlaying"
                @click="speechStore.speak(speakText(message.content))"
              >
                <el-icon>
                  <i class="icon-on-MPIS-TTS"></i>
                </el-icon>
              </el-button>
              <el-text
                :id="speakingTextId(speakText(message.content))"
                class="text text-content"
                :class="{
                  'speaking-active': speakingActive(
                    message.time,
                    currentTime,
                    speakText(message.content)
                  ),
                }"
                v-html="textView(message.content)"
                @click="aClick"
              ></el-text>
            </div>
            <!--译文-->
            <div
              class="translation-line message"
              :class="{
                'show-translation':
                  settingStore.exchangeTranslate[exchangeIndex],
              }"
            >
              {{ message.translation }}
            </div>
          </el-form-item>
        </el-form>
      </section>

      <!-- 情景对话 -->
      <section
        id="discussions"
        v-if="currentLesson?.discussions?.contents.length"
        class="section conversation-section"
      >
        <h2>
          <el-text
            class="text text-content-h2"
            v-html="textView(currentLesson?.discussions.title)"
            @click="aClick"
          ></el-text>
        </h2>
        <el-form
          label-width="auto"
          v-for="(exchange, exchangeIndex) in currentLesson?.discussions
            .contents"
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
              <el-button
                class="speech-button"
                size="small"
                circle
                :disabled="isPlaying"
                v-if="message.time && settingStore.audioSpeak"
                @click="playAudio(message.time, speechStore.repeatTimes)"
              >
                <el-icon>
                  <i class="icon-on-music"></i>
                </el-icon>
              </el-button>
              <el-button
                class="speech-button"
                v-else-if="settingStore.ttsSpeak"
                circle
                size="small"
                :disabled="isPlaying"
                @click="speechStore.speak(speakText(message.content))"
              >
                <el-icon>
                  <i class="icon-on-MPIS-TTS"></i>
                </el-icon>
              </el-button>
              <el-text
                :id="speakingTextId(speakText(message.content))"
                class="text text-content"
                :class="{
                  'speaking-active': speakingActive(
                    message.time,
                    currentTime,
                    speakText(message.content)
                  ),
                }"
                v-html="textView(message.content)"
                @click="aClick"
              ></el-text>
            </div>
            <!--译文-->
            <div
              class="translation-line message"
              :class="{
                'show-translation':
                  settingStore.exchange2Translate[exchangeIndex],
              }"
            >
              {{ message.translation }}
            </div>
          </el-form-item>
        </el-form>
      </section>

      <!-- 短文-->
      <section
        id="article"
        v-if="currentLesson?.article.contents.length"
        class="section"
        ref="articleRef"
      >
        <h2 class="h2">
          <el-button
            class="speech-button"
            :disabled="isPlaying"
            circle
            size="small"
            v-if="currentLesson?.article.time && settingStore.audioSpeak"
            @click="
              playAudio(currentLesson?.article.time, speechStore.repeatTimes)
            "
          >
            <el-icon>
              <i class="icon-on-music"></i>
            </el-icon>
          </el-button>
          <el-button
            v-else-if="settingStore.ttsSpeak"
            class="speech-button"
            circle
            size="small"
            :disabled="isPlaying"
            @click="
              speechStore.speakList(
                currentLesson?.article.contents.map((c) => speakText(c.content))
              )
            "
          >
            <i class="icon-on-MPIS-TTS"></i>
          </el-button>
          <el-text
            class="text text-content-h2"
            v-html="textView(currentLesson?.article.title)"
            @click="aClick"
          ></el-text>
        </h2>
        <el-form class="basics-list">
          <el-form-item
            class="message"
            v-for="(item, idx) in currentLesson?.article.contents"
            :key="`article-${idx}`"
          >
            <div class="text-row">
              <!--原文-->
              <el-button
                class="speech-button"
                :disabled="isPlaying"
                circle
                size="small"
                v-if="item.time && settingStore.audioSpeak"
                @click="playAudio(item.time, speechStore.repeatTimes)"
              >
                <el-icon>
                  <i class="icon-on-music"></i>
                </el-icon>
              </el-button>
              <el-button
                class="speech-button"
                circle
                size="small"
                v-else-if="settingStore.ttsSpeak"
                :disabled="isPlaying"
                @click="speechStore.speak(speakText(item.content))"
              >
                <i class="icon-on-MPIS-TTS"></i>
              </el-button>
              <el-text
                :id="speakingTextId(speakText(item.content))"
                class="text text-content article"
                :class="{
                  'speaking-active': speakingActive(
                    item.time,
                    currentTime,
                    speakText(item.content)
                  ),
                }"
                v-html="textView(item.content)"
                @click="aClick"
              ></el-text>
            </div>
            <!--译文-->
            <div
              class="translation-line message article-translation"
              :class="{ 'show-translation': settingStore.basicsTranslate }"
            >
              {{ item.translation }}
            </div>
          </el-form-item>
        </el-form>
      </section>

      <!-- 语法 -->
      <section
        id="grammars"
        class="section grammar"
        ref="grammarsRef"
        v-if="grammars.length > 0"
      >
        <el-collapse v-model="expands" :expand-icon-position="'left'">
          <el-collapse-item
            v-for="grammar in grammars"
            :title="grammar.title"
            :name="collapseTitle(grammar.title, grammar.idx)"
          >
            <div v-for="row in grammar.desc" v-html="row"></div>
          </el-collapse-item>
        </el-collapse>
      </section>
      <!-- 单词 -->
      <section id="words" class="section words-section" ref="wordsRef">
        <el-table :data="words" empty-text="暂无数据" stripe>
          <el-table-column label="单词" min-width="120">
            <template #default="scope">
              <div
                v-if="settingStore.word"
                :id="speakingWordId(scope.row as WordItem)"
                class="column-word"
                :class="{
                  'speaking-active': speechStore.isWordSpeaking(scope.row),
                }"
              >
                {{ scope.row.word }}
              </div>
              <div
                v-if="settingStore.kana"
                class="column-kana"
                :class="{
                  'speaking-active': speechStore.isWordSpeaking(scope.row),
                }"
              >
                {{ scope.row.kana }}
              </div>
            </template>
          </el-table-column>
          <el-table-column
            width="60"
            prop="pos"
            label="词性"
            show-overflow-tooltip
          />
          <el-table-column
            min-width="150"
            prop="desc"
            label="释义"
            v-if="settingStore.wordDesc"
            show-overflow-tooltip
          />
          <el-table-column
            class-name="dict-column"
            width="70"
            label="词典"
            v-if="settingStore.wordDict"
          >
            <template #default="scope">
              <Dictionary :word="scope.row.word" />
            </template>
          </el-table-column>
          <el-table-column
            width="50"
            v-if="settingStore.ttsSpeak"
            fixed="right"
          >
            <template #header>
              <el-button
                size="small"
                circle
                v-if="settingStore.ttsSpeak"
                :disabled="isPlaying"
                @click="speechStore.speakList(words as WordItem[])"
              >
                <el-icon>
                  <i class="icon-on-MPIS-TTS"></i>
                </el-icon>
              </el-button>
            </template>
            <template #default="scope">
              <el-button
                size="small"
                circle
                :disabled="isPlaying"
                @click="speechStore.speak(scope.row as WordItem)"
              >
                <el-icon>
                  <i class="icon-on-MPIS-TTS"></i>
                </el-icon>
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </section>
    </div>

    <div class="audio" v-if="settingStore.audioSpeak && !fullscreen">
      <audio
        ref="audioRef"
        :src="src"
        controls
        @timeupdate="onTimeUpdate"
        @play="onPlay"
        @pause="onPause"
        @error="onError"
        @abort="onAbort"
      ></audio>
    </div>

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
          @click="lessonStore.goLesson(Number(lesson.idx))"
        ></div>
        <div
          class="model-lesson-match-content"
          v-for="content in lesson.contents"
          v-html="searchLesson(displayText(content))"
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
import { computed, onActivated, onBeforeUnmount, ref, watch } from 'vue'
import { useLessonStore } from '../../stores/lessonStore.ts'
import { useSpeechStore } from '../../stores/speechStore.ts'
import { useSettingStore } from '../../stores/settingStore.ts'
import { useWordStore } from '../../stores/wordStore.ts'
import { useGrammarStore } from '../../stores/grammarStore.ts'
import type { WordItem } from '../../types'
import {
  searchLessonFunc,
  speakingId,
  speakingTextId,
  speakingWordId,
  speakText,
} from '../../utils'
import { storeToRefs } from 'pinia'
import { onDeactivated } from '@vue/runtime-core'
import { useRouter } from 'vue-router'
import { ElTable } from 'element-plus'
import LessonSelect from '../../components/LessonSelect.vue'
import { displayText, textParser } from './index.ts'
import { collapseTitle } from '../grammar'
import type { IndexItem } from '../../components/IndexBar'
import IndexBar from '../../components/IndexBar/IndexBar.vue'
import Dictionary from '../../components/Dictionary/Dictionary.vue'

const lessonStore = useLessonStore()
const speechStore = useSpeechStore()
const wordStore = useWordStore()
const settingStore = useSettingStore()
const grammarStore = useGrammarStore()

const { currentLesson, lessons } = storeToRefs(lessonStore)
const { fullscreen } = storeToRefs(settingStore)

const props = defineProps(['index'])
const router = useRouter()

if (props.index) {
  const index = Number(props.index)
  lessonStore.goLesson(index)
}

watch(
  () => lessonStore.currentLesson,
  (_) => {
    let index = lessonStore?.currentLesson?.index
    router.push(`/lesson/${index}`)
  }
)

const dialog = ref(false)

const top = ref()
const container = ref()
const grammarsRef = ref()
const articleRef = ref()
const wordsRef = ref()
const audioRef = ref<HTMLAudioElement>()

const currentTime = ref(0)
const audioPlaying = ref(false)

const isPlaying = computed(() => speechStore.isSpeaking || audioPlaying.value)

const src = computed(() => {
  if (speechStore.isSpeaking) {
    return void 0
  }
  return `${audioUrlBase}${currentLesson.value?.audio}`
})

const pauseHandler = async (url: string, playTimes: number) => {
  await playAudio(url, playTimes - 1)
}

let currentPauseHandler: (() => void) | null = null

const playAudio = async (timeRange: string, playTimes: number) => {
  if (!audioRef.value || !src.value || playTimes < 1) {
    return
  }

  const url = `${src.value}${timeRange}`
  audioRef.value.src = url

  // 移除旧的监听器
  if (currentPauseHandler) {
    audioRef.value?.removeEventListener('pause', currentPauseHandler)
  }
  // 创建并存储新的处理函数
  currentPauseHandler = () => pauseHandler(url, playTimes)
  audioRef.value?.addEventListener('pause', currentPauseHandler)

  audioRef.value.playbackRate = speechStore.rate
  audioRef.value.volume = speechStore.volume

  await audioRef.value.play()
}

const pauseAudio = () => {
  if (!isPlaying.value) return

  if (audioPlaying.value && audioRef.value) {
    // 移除监听器
    if (currentPauseHandler) {
      audioRef.value.removeEventListener('pause', currentPauseHandler)
      currentPauseHandler = null
    }
    audioRef.value.pause()
  }

  if (speechStore.isSpeaking) {
    speechStore.stop()
  }
}

const scrollPosition = ref<number>(0)

const lastElement = ref<HTMLElement | null>()

const audioUrlBase = import.meta.env.VITE_AUDIO_BASE

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
    const id = speakingId()
    if (!id) {
      return
    }
    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
    })
  }
)

const expands = ref<string[]>([])

const keyword = ref('')
const searchLesson = computed(() => searchLessonFunc(keyword.value || ''))
const fullLessons = computed(() => {
  // 用于搜索全部课文内容
  const flatLessons = lessons.value.map((lesson) => {
    return [
      `${lesson.index}`,
      lesson.title,
      ...lesson.sentences.map((a) => displayText(a.content)),
      ...lesson.conversations
        .flatMap((a) => a)
        .map((a) => displayText(a.content)),
      ...lesson.discussions.contents
        .flatMap((a) => a)
        .map((a) => displayText(a.content)),
      ...lesson.article.contents.map((a) => displayText(a.content)),
    ].filter(Boolean) as string[]
  })

  if (!keyword.value) {
    return flatLessons
      .map((lesson) => {
        const contents = lesson.slice(2)
        return {
          idx: lesson[0],
          title: lesson[1],
          contents: [...contents.slice(0, 2), '...'],
        }
      })
      .filter((a) => a.contents.length > 0)
  }

  return flatLessons
    .map((lesson) => {
      const contents = lesson.slice(2).filter((c) => c.includes(keyword.value))
      return { idx: lesson[0], title: lesson[1], contents }
    })
    .filter((a) => a.contents.length > 0)
})

const toggleFullscreen = (newStatus: boolean | null = null) => {
  settingStore.setFullscreen(newStatus !== null ? newStatus : !fullscreen.value)
}

const mainHeight = computed(() => {
  if (fullscreen.value) {
    // 全屏
    return `calc(100vh - var(--root-footer-height))`
  } else if (!settingStore.audioSpeak) {
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

const onTimeUpdate = () => {
  currentTime.value = audioRef.value?.currentTime || 0
}
const onPlay = () => {
  audioPlaying.value = true
}
const onPause = () => {
  audioPlaying.value = false
}
const onError = () => {
  audioPlaying.value = false
}
const onAbort = () => {
  audioPlaying.value = false
}

const speakingActive = (
  timeStr: string,
  currentTime: number,
  text: string = ''
): boolean => {
  if (text !== null && text.length > 0 && speechStore.speakingText === text) {
    return true
  }
  if (!audioRef.value || audioRef.value.paused) {
    return false
  }
  if (!timeStr || !currentTime) {
    return false
  }
  const timePart = timeStr.split(',').map(Number)
  return currentTime > timePart[0] && currentTime < timePart[1]
}

const grammars = computed(() => {
  return grammarStore.queryGrammars({ lesson: lessonStore.currentIndex })
})

const words = computed(() => {
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

<style>
:root {
  --lesson-headers-height: 60px;
}
</style>

<style scoped>
.lessons {
  width: 100%;
  height: 100%;
  position: fixed;
}

.lesson-headers {
  height: var(--lesson-headers-height);
  width: 100%;
  overflow-y: scroll;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

.lesson-switch {
  width: 100%;
  margin: 0 auto;
  text-align: center;
  max-width: var(--content-max-width);
  display: flex;
  justify-content: space-between;
  position: relative;
  gap: var(--gap12);
}

.lesson-main {
  overflow-y: scroll;
  margin: 0 auto;
  width: 100vw;
  height: v-bind(mainHeight);
}

.lesson-main > * {
  max-width: var(--content-max-width);
  margin: 0 auto;
}

.function-group {
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;
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

.speech-button {
  margin-bottom: 0.5rem;
}

.speech-button:first-child {
  margin-right: 1rem;
}

.speech-button:last-child {
  margin-left: 1rem;
}

.speaking-active a:link {
  color: var(--el-color-success);
}

:deep(.speaking-active a:visited) {
  color: var(--el-color-success);
}

:deep(.speaking-active a:hover) {
  color: #4285f4;
}

:deep(.speaking-active a:active) {
  color: #ff0000;
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
  display: none;
  transition: opacity 0.3s ease;
}

.translation-line.show-translation {
  display: inherit;
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

.column-word {
  font-size: 1rem;
}

:deep(.el-tooltip__trigger) {
  outline: none;
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

.column-kana {
  font-size: 0.8rem;
}

:deep(.dict-column .cell) {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.dict-item {
  display: inline-block;
  width: 24px;
  height: 24px;
}

.dict-item img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
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

.audio {
  width: 100%;
  overflow-y: scroll;
  height: var(--audio-height);
}

audio {
  display: block;
  margin: 0 auto;
  width: 100%;
  max-width: var(--content-max-width);
}

.go-top {
  position: absolute;
  bottom: 100px;
  right: 50px;
  width: 30px;
  height: 30px;
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
