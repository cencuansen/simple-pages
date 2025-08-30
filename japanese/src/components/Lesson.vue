<template>
  <div class="lessons" v-if="currentLesson">
    <div class="lesson-headers" v-if="!fullscreen">
      <div class="lesson-switch">
        <el-button
          size="small"
          class="previous-button navigation-item"
          :disabled="!lessonStore.hasPrevious"
          @click="lessonStore.goPrevious"
        >
          上一课
        </el-button>
        <el-select
          size="small"
          class="navigation-item"
          v-model="lessonStore.currentIndex"
          fit-input-width
        >
          <el-option
            v-for="item in lessonStore.lessons"
            :value="item.index"
            :label="`${displayText(item.title?.content)}`"
          />
        </el-select>
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
          :type="baseSettingStore.allTranslate ? 'primary' : ''"
          size="small"
          circle
          title="翻译"
          v-if="baseSettingStore.translate"
          @click="
            baseSettingStore.setAllTranslate(!baseSettingStore.allTranslate)
          "
        >
          译
        </el-button>
        <el-button
          :type="baseSettingStore.furigana ? 'primary' : ''"
          size="small"
          circle
          title="注音"
          @click="baseSettingStore.furiganaToggle"
        >
          注
        </el-button>
        <el-button
          :type="baseSettingStore.wordLink ? 'primary' : ''"
          size="small"
          circle
          title="单词跳转"
          @click="baseSettingStore.wordLinkToggle"
        >
          跳
        </el-button>
        <el-button
          :type="''"
          size="small"
          circle
          title="搜索"
          @click="searchModel = !searchModel"
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
          v-if="currentLesson?.audio && baseSettingStore.audioSpeak"
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
      <h1 class="lesson-title">
        <el-text
          class="text-title"
          v-html="textView(currentLesson?.title?.content)"
          @click="aClick"
        ></el-text>
      </h1>

      <!-- 简单句子 -->
      <section
        v-if="currentLesson?.basics?.length"
        class="section basics-section"
      >
        <el-form class="basics-list">
          <el-form-item
            class="message"
            v-for="(item, idx) in currentLesson?.basics"
            :key="`basic-${idx}`"
          >
            <div class="text-row">
              <!--原文-->
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
              <el-button
                :disabled="isPlaying"
                circle
                size="small"
                v-if="item.time && baseSettingStore.audioSpeak"
                @click="playAudio(item.time, speechStore.repeatTimes)"
              >
                <el-icon>
                  <i class="icon-on-music"></i>
                </el-icon>
              </el-button>
              <el-button
                circle
                size="small"
                v-else-if="baseSettingStore.ttsSpeak"
                :disabled="isPlaying"
                @click="speechStore.speak(speakText(item.content))"
              >
                <i class="icon-on-MPIS-TTS"></i>
              </el-button>
            </div>
            <!--译文-->
            <div
              class="translation-line message"
              :class="{ 'show-translation': baseSettingStore.basicsTranslate }"
            >
              {{ item.translation }}
            </div>
          </el-form-item>
        </el-form>
      </section>

      <!-- 普通对话 -->
      <section
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
              <el-button
                size="small"
                circle
                :disabled="isPlaying"
                v-if="message.time && baseSettingStore.audioSpeak"
                @click="playAudio(message.time, speechStore.repeatTimes)"
              >
                <el-icon>
                  <i class="icon-on-music"></i>
                </el-icon>
              </el-button>
              <el-button
                v-else-if="baseSettingStore.ttsSpeak"
                circle
                size="small"
                :disabled="isPlaying"
                @click="speechStore.speak(speakText(message.content))"
              >
                <el-icon>
                  <i class="icon-on-MPIS-TTS"></i>
                </el-icon>
              </el-button>
            </div>
            <!--译文-->
            <div
              class="translation-line message"
              :class="{
                'show-translation':
                  baseSettingStore.exchangeTranslate[exchangeIndex],
              }"
            >
              {{ message.translation }}
            </div>
          </el-form-item>
        </el-form>
      </section>

      <!-- 情景对话 -->
      <section
        v-if="currentLesson?.conversations2?.length"
        class="section conversation-section"
      >
        <h2>
          <el-text
            class="text text-content-h2"
            v-html="textView(currentLesson?.title2.content)"
            @click="aClick"
          ></el-text>
        </h2>
        <el-form
          label-width="auto"
          v-for="(exchange, exchangeIndex) in currentLesson?.conversations2"
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
              <el-button
                size="small"
                circle
                :disabled="isPlaying"
                v-if="message.time && baseSettingStore.audioSpeak"
                @click="playAudio(message.time, speechStore.repeatTimes)"
              >
                <el-icon>
                  <i class="icon-on-music"></i>
                </el-icon>
              </el-button>
              <el-button
                v-else-if="baseSettingStore.ttsSpeak"
                circle
                size="small"
                :disabled="isPlaying"
                @click="speechStore.speak(speakText(message.content))"
              >
                <el-icon>
                  <i class="icon-on-MPIS-TTS"></i>
                </el-icon>
              </el-button>
            </div>
            <!--译文-->
            <div
              class="translation-line message"
              :class="{
                'show-translation':
                  baseSettingStore.exchange2Translate[exchangeIndex],
              }"
            >
              {{ message.translation }}
            </div>
          </el-form-item>
        </el-form>
      </section>

      <!-- 语法 -->
      <section class="section grammar" ref="grammarsRef">
        <el-table :data="grammars" empty-text="暂无数据" stripe>
          <el-table-column label="语法" prop="content" min-width="200" />
          <el-table-column label="说明" min-width="200">
            <template #default="scope">
              <div v-if="scope.row.desc" v-html="scope.row.desc"></div>
              <br v-if="scope.row.remark" />
              <div v-html="scope.row.remark"></div>
            </template>
          </el-table-column>
        </el-table>
      </section>

      <!-- 单词 -->
      <section class="section words-section" ref="wordsRef">
        <el-table :data="words" empty-text="暂无数据" stripe>
          <el-table-column label="单词" min-width="150">
            <template #default="scope">
              <div
                v-if="baseSettingStore.word"
                :id="speakingWordId(scope.row as WordItem)"
                class="column-word"
                :class="{
                  'speaking-active': speechStore.isWordSpeaking(scope.row),
                }"
              >
                {{ scope.row.word }}
              </div>
              <div
                v-if="baseSettingStore.kana"
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
            v-if="baseSettingStore.wordDesc"
            show-overflow-tooltip
          />
          <el-table-column
            class-name="dict-column"
            width="60"
            label="字典"
            v-if="baseSettingStore.wordDict"
          >
            <template #default="scope">
              <a
                title="mazii"
                class="dict-item"
                target="_blank"
                :href="`https://mazii.net/zh-CN/search/word/jacn/${scope.row.word}`"
              >
                <img src="/mazii.png" alt="mazii" />
              </a>
            </template>
          </el-table-column>
          <el-table-column
            width="50"
            v-if="baseSettingStore.ttsSpeak"
            fixed="right"
          >
            <template #header>
              <el-button
                size="small"
                circle
                v-if="baseSettingStore.ttsSpeak"
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

    <div class="audio" v-if="baseSettingStore.audioSpeak && !fullscreen">
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

    <el-dialog class="search-model" v-model="searchModel" :modal="false">
      <template #header>
        <el-input
          v-model.lazy="keyword"
          size="small"
          placeholder="搜索"
          clearable
        />
      </template>
      <div class="model-result-item" v-for="lesson in lessonsView">
        <div
          class="model-lesson-title"
          v-html="textView(lesson.title, false, false)"
          @click="lessonStore.goLesson(Number(lesson.idx))"
        ></div>
        <div
          class="model-lesson-match-content"
          v-for="content in lesson.contents"
          v-html="matchText(textView(content, false, false))"
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
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch, onActivated } from 'vue'
import { useLessonStore } from '../stores/lessonStore'
import { useSpeechStore } from '../stores/speechStore'
import { useBaseSettingStore } from '../stores/baseSettingStore'
import { useWordStore } from '../stores/wordStore'
import { useGrammarStore } from '../stores/grammarStore'
import type { WordItem } from '../types'
import {
  speakingId,
  speakingTextId,
  speakingWordId,
  matchTextFunc,
  speakText,
  displayText,
} from '../utils.ts'
import { storeToRefs } from 'pinia'
import { onDeactivated } from '@vue/runtime-core'
import { useRouter } from 'vue-router'
import { ElTable } from 'element-plus'

const lessonStore = useLessonStore()
const speechStore = useSpeechStore()
const wordStore = useWordStore()
const baseSettingStore = useBaseSettingStore()
const grammarStore = useGrammarStore()

const { currentLesson, lessons } = storeToRefs(lessonStore)
const { fullscreen } = storeToRefs(baseSettingStore)

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

const searchModel = ref(false)

const top = ref()
const container = ref()
const grammarsRef = ref()
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
  () => baseSettingStore.translate,
  (value, _) => {
    if (!value) {
      // 设置中关闭翻译功能时
      baseSettingStore.setAllTranslate(false)
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

const keyword = ref('')
const matchText = computed(() => matchTextFunc(keyword.value || ''))
const lessonsView = computed(() => {
  const flatLessons = lessons.value.map((lesson, index) => {
    return [
      `${index}`,
      lesson.title?.content,
      ...lesson.basics.map((a) => a.content),
      ...lesson.conversations.flatMap((a) => a).map((a) => a.content),
      ...lesson.conversations2.flatMap((a) => a).map((a) => a.content),
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
  baseSettingStore.setFullscreen(
    newStatus !== null ? newStatus : !fullscreen.value
  )
}

const mainHeight = computed(() => {
  if (fullscreen.value) {
    return `calc(100vh - var(--root-footer-height))`
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

const wordRegEx = computed(() => {
  let wordCopy = words.value.slice()
  wordCopy.sort((a, b) => b.word.length - a.word.length)
  return new RegExp(
    wordCopy
      .map(
        (word) =>
          word.word
            .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            .split('') // 将单词拆分为字符数组
            .join('\\s*') // 在每个字符之间添加\s*以匹配任意空格
      )
      .join('|'),
    'g'
  )
})

const highlightReplacer = (match: string) => {
  match = match.replace(/\s/g, '')
  if (!match) return match
  const word = words.value.find((w) => w.word === match || w.kana === match)
  if (!word) return match
  return `<a href="#${speakingWordId(word)}" class="highlight-word">${word?.word}</a>`
}

const textView = (
  originalText: string | undefined = '',
  wordLink = true,
  furigana = true
) => {
  const baseText = originalText.replace(/!([^(]+)\(([^)]+)\)/g, '$1')
  if (words.value.length === 0) return baseText

  let finalText = baseText

  // 单词跳转
  if (wordLink && baseSettingStore.wordLink) {
    finalText = baseText.replace(wordRegEx.value, highlightReplacer)
  }

  // 注音
  if (furigana && baseSettingStore.furigana) {
    const rubyText = originalText.match(/!([^(]+)\(([^)]+)\)/g) || []
    const rubyMap: Record<string, string> = {}
    rubyText.forEach((item) => {
      const [, kanji, kana] = item.match(/!([^(]+)\(([^)]+)\)/) || []
      rubyMap[kanji] = kana
    })

    const rubyRegEx =
      /(<a\b[^>]*href=["'][^"']*["'][^>]*>)|(<ruby>[^<]*<\/ruby>)|([^<]+)|(<\/a>)/g

    finalText = finalText.replace(
      rubyRegEx,
      (match, hrefPart, rubyPart, textPart, closingTag) => {
        if (hrefPart) return hrefPart
        if (rubyPart) return rubyPart
        if (closingTag) return closingTag
        if (
          textPart !== undefined &&
          textPart !== null &&
          textPart.trim() !== ''
        ) {
          const kanjis = Object.keys(rubyMap).sort(
            (a, b) => b.length - a.length
          )
          for (const kanji of kanjis) {
            const kana = rubyMap[kanji]
            textPart = textPart.replace(
              new RegExp(`${kanji}(?!(?:(?!<ruby>).)*<\/ruby>)`, 'g'),
              `<ruby>${kanji}<rt data-ruby="${kana}"/></ruby>`
            )
          }
          return textPart
        }
        return match
      }
    )
  }

  return finalText
}

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

const onSingleKeyup = (event: KeyboardEvent) => {
  if (event.ctrlKey || event.altKey || event.shiftKey || event.metaKey) {
    return
  }
  if (['ArrowLeft'].includes(event.key)) {
    lessonStore.goPrevious()
  } else if (['ArrowRight'].includes(event.key)) {
    lessonStore.goNext()
  } else if (['1'].includes(event.key)) {
    scrollTarget(top.value, {
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
    })
  } else if (['2'].includes(event.key)) {
    scrollTarget(grammarsRef.value, {
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
    })
  } else if (['3'].includes(event.key)) {
    scrollTarget(wordsRef.value, {
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
    })
  } else if (['f'].includes(event.key)) {
    searchModel.value = !searchModel.value
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

watch(
  () => searchModel.value,
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

.text-title {
  font-size: 1.8rem;
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
  font-size: 1.2rem;
  line-height: var(--text-content-line-height);
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

:deep(.message) {
  margin-bottom: 10px;
}

.text-row {
  display: flex;
  align-items: center;
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

.column-kanji {
  font-size: 1rem;
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

.highlight-word {
  color: inherit;
  text-decoration: none;
}

.highlight-word span {
  border-bottom: 1px dashed #1976d2;
}

.highlight-word:hover span {
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
