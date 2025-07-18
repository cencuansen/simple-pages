<template>
  <div class="lesson-header-container">
    <div class="lesson-header navigation-buttons">
      <el-button
          size="small"
          class="previous-button navigation-item"
          :disabled="!lessonStore.hasPrevious"
          @click="goToLesson(lessonStore.currentIndex - 1)"
      >
        上一课
      </el-button>
      <el-select size="small" class="navigation-item" v-model="lessonStore.currentIndex" fit-input-width>
        <el-option
            v-for="(item, index) in lessonStore.lessons"
            :key="index"
            :label="`${displayText(item.title?.content)}`"
            :value="index"
        />
      </el-select>
      <el-button
          size="small"
          class="next-button navigation-item"
          :disabled="!lessonStore.hasNext"
          @click="goToLesson(lessonStore.currentIndex + 1)"
      >
        下一课
      </el-button>
    </div>
    <div class="function-group">
      <el-button
          :type="allTranslate ? 'primary' : ''"
          size="small"
          circle
          title="翻译"
          v-if="baseSettingStore.translate"
          @click="toggleAllTranslations(!allTranslate)">
        译
      </el-button>
      <el-button
          :type="baseSettingStore.furigana ? 'primary' : ''"
          size="small"
          circle
          title="注音"
          @click="baseSettingStore.furiganaToggle">
        注
      </el-button>
      <el-button
          :type="baseSettingStore.wordLink ? 'primary' : ''"
          size="small"
          circle
          title="单词跳转"
          @click="baseSettingStore.wordLinkToggle">
        跳
      </el-button>
      <el-button
          :type="''"
          size="small"
          circle
          title="播放"
          :disabled="isPlaying"
          v-if="lessonStore.currentLesson?.audio && baseSettingStore.audioSpeak"
          @click="playAudio(``, speechStore.repeatTimes)">
        <el-icon>
          <i class="icon-on-music"></i>
        </el-icon>
      </el-button>
      <el-button
          :type="''"
          size="small"
          circle
          v-if="isPlaying"
          title="停止播放"
          @click="pauseAudio">
        停
      </el-button>
    </div>
  </div>

  <div ref="container" @scroll="containerOnScroll" class="lesson-container" v-if="lessonStore.currentLesson">
    <div ref="top"></div>
    <h1 class="lesson-title">
      <el-text class="text-title" v-html="textView(lessonStore.currentLesson?.title?.content)"
               @click="handleAnchorClick"></el-text>
    </h1>

    <!-- 简单句子 -->
    <section v-if="lessonStore.currentLesson?.basics?.length" class="section basics-section">
      <el-form class="basics-list">
        <el-form-item class="message" v-for="(item, idx) in lessonStore.currentLesson?.basics" :key="`basic-${idx}`">
          <div class="text-row">
            <!--原文-->
            <el-text
                :id="speakingTextId(speakText(item.content))"
                class="text text-content"
                :class="{'speaking-active': speakingActive(item.time, currentTime, speakText(item.content))}"
                v-html="textView(item.content)" @click="handleAnchorClick"></el-text>
            <el-button :disabled="isPlaying" circle
                       size="small" v-if="item.time && baseSettingStore.audioSpeak"
                       @click="playAudio(item.time, speechStore.repeatTimes)">
              <el-icon>
                <i class="icon-on-music"></i>
              </el-icon>
            </el-button>
            <el-button circle size="small"
                       v-else-if="baseSettingStore.ttsSpeak"
                       :disabled="isPlaying"
                       @click="speechStore.speak(speakText(item.content))">
              <i class="icon-on-MPIS-TTS"></i>
            </el-button>
          </div>
          <!--译文-->
          <div class="translation-line message"
               :class="{ 'show-translation': basicsTranslate }">
            {{ item.translation }}
          </div>
        </el-form-item>
      </el-form>
    </section>

    <!-- 普通对话 -->
    <section v-if="lessonStore.currentLesson?.conversations?.length" class="section conversation-section">
      <el-form v-for="(exchange, exchangeIndex) in lessonStore.currentLesson?.conversations"
               :key="`exchange2-${exchangeIndex}`" class="conversation-exchange">

        <el-form-item :label="message.speaker" class="message speaker" :class="[ `speaker-${message.speaker}`]"
                      v-for="(message, messageIndex) in exchange" :key="`message2-${exchangeIndex}-${messageIndex}`">
          <div class="text-row">
            <!--原文-->
            <el-text
                :id="speakingTextId(speakText(message.content))"
                class="text text-content"
                :class="{'speaking-active': speakingActive(message.time, currentTime, speakText(message.content))}"
                v-html="textView(message.content)" @click="handleAnchorClick"></el-text>
            <el-button
                size="small"
                circle
                :disabled="isPlaying"
                v-if="message.time && baseSettingStore.audioSpeak"
                @click="playAudio(message.time, speechStore.repeatTimes)">
              <el-icon>
                <i class="icon-on-music"></i>
              </el-icon>
            </el-button>
            <el-button v-else-if="baseSettingStore.ttsSpeak" circle size="small"
                       :disabled="isPlaying" @click="speechStore.speak(speakText(message.content))">
              <el-icon>
                <i class="icon-on-MPIS-TTS"></i>
              </el-icon>
            </el-button>
          </div>
          <!--译文-->
          <div class="translation-line message"
               :class="{ 'show-translation': exchangeTranslate[exchangeIndex] }">
            {{
              message.translation
            }}
          </div>
        </el-form-item>
      </el-form>
    </section>

    <!-- 情景对话 -->
    <section v-if="lessonStore.currentLesson?.conversations2?.length" class="section conversation-section">
      <h2>
        <el-text class="text text-content-h2" v-html="textView(lessonStore.currentLesson?.title2.content)"
                 @click="handleAnchorClick"></el-text>
      </h2>
      <el-form label-width="auto" v-for="(exchange, exchangeIndex) in lessonStore.currentLesson?.conversations2"
               :key="`exchange2-${exchangeIndex}`" class="conversation-exchange">
        <el-form-item :label="message.speaker" class="message speaker" :class="[`speaker-${message.speaker}`]"
                      v-for="(message, messageIndex) in exchange" :key="`message2-${exchangeIndex}-${messageIndex}`">
          <div class="text-row">
            <!--原文-->
            <el-text
                :id="speakingTextId(speakText(message.content))"
                class="text text-content"
                :class="{'speaking-active': speakingActive(message.time, currentTime, speakText(message.content))}"
                v-html="textView(message.content)" @click="handleAnchorClick"></el-text>
            <el-button
                size="small"
                circle
                :disabled="isPlaying"
                v-if="message.time && baseSettingStore.audioSpeak"
                @click="playAudio(message.time, speechStore.repeatTimes)">
              <el-icon>
                <i class="icon-on-music"></i>
              </el-icon>
            </el-button>
            <el-button v-else-if="baseSettingStore.ttsSpeak" circle size="small"
                       :disabled="isPlaying"
                       @click="speechStore.speak(speakText(message.content))">
              <el-icon>
                <i class="icon-on-MPIS-TTS"></i>
              </el-icon>
            </el-button>
          </div>
          <!--译文-->
          <div class="translation-line message"
               :class="{ 'show-translation': exchange2Translate[exchangeIndex] }">
            {{
              message.translation
            }}
          </div>
        </el-form-item>
      </el-form>
    </section>

    <!-- 语法 -->
    <section class="section grammar">
      <el-table :data="grammars">
        <el-table-column label="语法" prop="content"/>
        <el-table-column label="说明">
          <template #default="scope">
            <div v-html="scope.row.desc"></div>
            <br v-if="scope.row.remark"/>
            <div v-html="scope.row.remark"></div>
          </template>
        </el-table-column>
      </el-table>
    </section>

    <!-- 单词 -->
    <section class="section words-section">
      <el-table :data="words">
        <el-table-column label="单词">
          <template #default="scope">
            <div v-if="baseSettingStore.word" :id="speakingWordId(scope.row as WordItem)"
                 class="column-word" :class="{'speaking-active': speechStore.isWordSpeaking(scope.row)}">
              {{ scope.row.word }}
            </div>
            <div v-if="baseSettingStore.kana" class="column-kana"
                 :class="{'speaking-active': speechStore.isWordSpeaking(scope.row)}">{{ scope.row.kana }}
            </div>
          </template>
        </el-table-column>
        <el-table-column width="60" prop="pos" label="词性" show-overflow-tooltip/>
        <el-table-column prop="desc" label="释义" v-if="baseSettingStore.wordDesc" show-overflow-tooltip/>
        <el-table-column width="50" v-if="baseSettingStore.ttsSpeak">
          <template #header>
            <el-button
                size="small"
                circle
                v-if="baseSettingStore.ttsSpeak"
                :disabled="isPlaying"
                @click="speechStore.speakList(words as WordItem[])">
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
                @click="speechStore.speak(scope.row as WordItem)">
              <el-icon>
                <i class="icon-on-MPIS-TTS"></i>
              </el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>
  </div>

  <a class="go-top" href="#" @click="goTop">↑</a>

  <audio v-if="baseSettingStore.audioSpeak" ref="audioRef" :src="src"
         controls
         @timeupdate="onTimeUpdate"
         @play="onPlay"
         @pause="onPause"
         @error="onError"
         @abort="onAbort"
  ></audio>
</template>

<script setup lang="ts">
import {computed, onBeforeUnmount, ref, watch, onActivated} from 'vue'
import {useLessonStore} from '../stores/lessonStore'
import {useSpeechStore} from "../stores/speechStore"
import {useBaseSettingStore} from "../stores/baseSettingStore"
import {useWordStore} from "../stores/wordStore"
import {useGrammarStore} from "../stores/grammarStore"
import type {WordItem} from "../types";
import {speakingId, speakingTextId, speakingWordId} from '../utils.ts'

const lessonStore = useLessonStore()
const speechStore = useSpeechStore()
const wordStore = useWordStore()
const baseSettingStore = useBaseSettingStore()
const grammarStore = useGrammarStore()

const allTranslate = ref(false)
const basicsTranslate = ref(false)
const exchangeTranslate = ref<boolean[]>(new Array(100).fill(false))
const exchange2Translate = ref<boolean[]>(new Array(100).fill(false))

const audioRef = ref<HTMLAudioElement>()
const currentTime = ref(0)
const audioPlaying = ref(false)

const isPlaying = computed(() => speechStore.isSpeaking || audioPlaying.value)

const src = computed(() => {
  if (speechStore.isSpeaking) {
    return void 0;
  }
  return `${audioUrlBase}${lessonStore.currentLesson?.audio}`;
})

const pauseHandler = async (url: string, playTimes: number) => {
  await playAudio(url, playTimes - 1)
}

// 存储当前活动的pause处理函数
let currentPauseHandler: (() => void) | null = null;

const playAudio = async (timeRange: string, playTimes: number) => {
  if (!audioRef.value || !src.value || playTimes < 1) {
    return;
  }

  const url = `${src.value}${timeRange}`;
  audioRef.value.src = url;

  // 移除旧的监听器
  if (currentPauseHandler) {
    audioRef.value?.removeEventListener('pause', currentPauseHandler);
  }
  // 创建并存储新的处理函数
  currentPauseHandler = () => pauseHandler(url, playTimes);
  audioRef.value?.addEventListener('pause', currentPauseHandler);

  audioRef.value.playbackRate = speechStore.rate;
  audioRef.value.volume = speechStore.volume;

  await audioRef.value.play()
}

const pauseAudio = () => {
  if (!isPlaying.value) return;

  if (audioPlaying.value && audioRef.value) {
    // 移除监听器
    if (currentPauseHandler) {
      audioRef.value.removeEventListener('pause', currentPauseHandler);
      currentPauseHandler = null;
    }
    audioRef.value.pause();
  }

  if (speechStore.isSpeaking) {
    speechStore.stop();
  }
};

const container = ref()
const scrollPosition = ref<number>(0)
const top = ref()
const lastElement = ref<HTMLElement | null>()

const audioUrlBase = import.meta.env.VITE_AUDIO_BASE

// 全局切换
const toggleAllTranslations = (newValue: boolean) => {
  allTranslate.value = newValue
  // 基础句子
  basicsTranslate.value = allTranslate.value
  // 简单对话
  for (let i = 0; i < exchangeTranslate.value.length; i++) {
    exchangeTranslate.value[i] = allTranslate.value
  }
  // 情景对话
  for (let i = 0; i < exchange2Translate.value.length; i++) {
    exchange2Translate.value[i] = allTranslate.value
  }
}

watch(() => baseSettingStore.translate, (value, _) => {
  if (!value) {
    // 设置中关闭翻译功能时
    toggleAllTranslations(false)
  }
})

watch(() => speechStore.lastFireTime, (_) => {
  const id = speakingId()
  if (!id) {
    return;
  }
  document.getElementById(id)?.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
    inline: 'nearest'
  });
});

const handleAnchorClick = (event: any) => {
  event.preventDefault();
  let target = event.target
  if (event.target.tagName.toLowerCase() === 'ruby') {
    target = event.target.parentElement
  }
  if (target.tagName.toLowerCase() === 'a') {
    const href = target.getAttribute('href');
    if (href && href.startsWith('#')) {
      const targetElement = container.value.querySelector(href);
      if (targetElement) {
        lastElement.value = target
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest',
        });
        targetElement.classList.add("target-active");
        targetElement.addEventListener("animationend", () => {
          targetElement.classList.remove("target-active");
        });
      }
    }
  }
};

const onTimeUpdate = () => {
  currentTime.value = audioRef.value?.currentTime || 0;
}
const onPlay = () => {
  audioPlaying.value = true;
}
const onPause = () => {
  audioPlaying.value = false;
}
const onError = () => {
  audioPlaying.value = false;
}
const onAbort = () => {
  audioPlaying.value = false;
}

const speakingActive = (timeStr: string, currentTime: number, text: string = ""): boolean => {
  if (text !== null && text.length > 0 && speechStore.speakingText === text) {
    return true
  }
  if (!audioRef.value || audioRef.value.paused) {
    return false
  }
  if (!timeStr || !currentTime) {
    return false
  }
  const timePart = timeStr.split(",").map(Number)
  return currentTime > timePart[0] && currentTime < timePart[1]
}

const goToLesson = async (index: number) => {
  lessonStore.setCurrentIndex(index)
}

const grammars = computed(() => {
  return grammarStore.queryGrammars({lesson: lessonStore.currentIndex + 1})
})

const words = computed(() => {
  return wordStore.getByLesson(lessonStore.currentIndex + 1)
})

const wordRegEx = computed(() => {
  let wordCopy = words.value.slice()
  wordCopy.sort((a, b) => b.word.length - a.word.length)
  return new RegExp(
      wordCopy.map(word =>
          word.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
              .split('') // 将单词拆分为字符数组
              .join('\\s*') // 在每个字符之间添加\s*以匹配任意空格
      ).join('|'),
      'g'
  );
})

const highlightReplacer = (match: string) => {
  match = match.replace(/\s/g, '')
  if (!match) return match
  const word = words.value.find(w => w.word === match || w.kana === match)
  if (!word) return match
  return `<a href="#${speakingWordId(word)}" class="highlight-word">${word?.word}</a>`
}

const speakText = (text: string | undefined = "") => text.replace(/![^(]+\(([^)]+)\)/g, '$1')
const displayText = (text: string | undefined = "") => text.replace(/!([^(]+)\([^)]+\)/g, '$1')
const textView = (originalText: string | undefined = "") => {
  const baseText = originalText.replace(/!([^(]+)\(([^)]+)\)/g, '$1');
  if (words.value.length === 0) return baseText

  let finalText = baseText

  // 单词跳转
  if (baseSettingStore.wordLink) {
    finalText = baseText.replace(wordRegEx.value, highlightReplacer)
  }

  // 注音
  if (baseSettingStore.furigana) {
    const rubyText = originalText.match(/!([^(]+)\(([^)]+)\)/g) || [];
    const rubyMap: Record<string, string> = {};
    rubyText.forEach(item => {
      const [, kanji, kana] = item.match(/!([^(]+)\(([^)]+)\)/) || [];
      rubyMap[kanji] = kana;
    });

    const rubyRegEx = /(<a\b[^>]*href=["'][^"']*["'][^>]*>)|(<ruby>[^<]*<\/ruby>)|([^<]+)|(<\/a>)/g

    finalText = finalText.replace(rubyRegEx, (match, hrefPart, rubyPart, textPart, closingTag) => {
      if (hrefPart) return hrefPart;
      if (rubyPart) return rubyPart;
      if (closingTag) return closingTag;
      if (textPart !== undefined && textPart !== null && textPart.trim() !== "") {
        const kanjis = Object.keys(rubyMap).sort((a, b) => b.length - a.length)
        for (const kanji of kanjis) {
          const kana = rubyMap[kanji]
          textPart = textPart.replace(new RegExp(`${kanji}(?!(?:(?!<ruby>).)*<\/ruby>)`, "g"), `<ruby>${kanji}<rt data-ruby="${kana}"/></ruby>`)
        }
        return textPart;
      }
      return match;
    });
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
    temp.classList.add("target-active");
    temp.addEventListener("animationend", () => {
      temp.classList.remove("target-active");
    });
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

const containerOnScroll = async () => {
  scrollPosition.value = container.value.scrollTop
}

onActivated(async () => {
  setTimeout(() => {
    if (container && container.value) {
      container.value.scrollTop = scrollPosition.value
    }
  })
})

document.addEventListener('keyup', function (event) {
  if (event.key === 'r' || event.key === 'R') {
    console.log('r 被按下')
  }
});

</script>

<style scoped>

.lesson-header-container {
  overflow-y: scroll;
}

.lesson-header {
  margin: 10px auto;
  text-align: center;
  max-width: var(--content-max-width);
}

.lesson-container {
  overflow-y: scroll;
  position: fixed;
  margin: 0 auto;
  width: 100vw;
  padding-bottom: 160px;
  height: calc(100vh - 85px);
}

.lesson-container > * {
  max-width: var(--content-max-width);
  margin: 0 auto;
}

.navigation-item {
  margin-right: 20px;
}

.navigation-item:last-child {
  margin-right: 0;
}

.function-group {
  margin: 10px auto;
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

.lesson-header, .lesson-title, .basics-section, .conversation-section {
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
  color: #4285F4;
}

:deep(.speaking-active a:active) {
  color: #FF0000;
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
  0%, 20%, 40%, 60%, 80% {
    color: #ff0000;
  }
  10%, 30%, 50%, 70%, 90% {
    color: #ff9900;
  }
  100% {
    color: inherit;
  }
}

.column-kanji {
  font-size: 1rem;
}

.column-kana {
  font-size: .8rem;
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

.navigation-buttons {
  display: flex;
  justify-content: space-between;
  position: relative;
}

.go-top {
  position: absolute;
  bottom: 60px;
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
  backdrop-filter: blur(1000px);
  text-decoration: none;
}

.speaking-active {
  color: var(--el-color-success);
}

audio {
  position: absolute;
  margin-left: 50%;
  transform: translate(-50%);
  bottom: 0;
  width: 100%;
}
</style>
