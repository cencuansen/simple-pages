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
            :label="`${getDisplayText(item.title?.content)}`"
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
  </div>

  <div ref="container" class="lesson-container" v-if="lessonStore.currentLesson">
    <div ref="top"></div>
    <div class="function-group">
      <el-button
          type="primary"
          size="small"
          circle
          v-if="baseSettingStore.translate"
          @click="toggleAllTranslations(!showAllTranslations)">
        <el-icon>
          <Switch/>
        </el-icon>
      </el-button>
      <el-button
          type="primary"
          size="small"
          circle
          v-if="lessonStore.currentLesson.audio"
          @click="playAudio(lessonStore.currentLesson.audio)">
        <el-icon>
          <VideoPlay/>
        </el-icon>
      </el-button>
    </div>
    <h1 class="lesson-title">
      <el-text class="text-title" v-html="textHandler(lessonStore.currentLesson.title?.content)"
               @click="handleAnchorClick"></el-text>
    </h1>

    <!-- 简单句子 -->
    <section v-if="lessonStore.currentLesson.basics?.length" class="section basics-section">
      <el-form class="basics-list">
        <el-form-item class="message" v-for="(item, idx) in lessonStore.currentLesson.basics" :key="`basic-${idx}`">
          <div>
            <!--原文-->
            <el-text class="text text-content"
                     :class="{'speaking-active': speakingActive(item.time, currentTime)}"
                     v-html="textHandler(item.content)" @click="handleAnchorClick"></el-text>
            <el-button circle type="primary" size="small" v-if="item.time"
                       @click="playAudio(`${lessonStore.currentLesson.audio}${item.time}`)">
              <el-icon>
                <VideoPlay/>
              </el-icon>
            </el-button>
            <el-button v-else circle type="primary" size="small" :disabled="speechStore.isSpeaking"
                       @click="speechStore.speak(speakText(item.content))">
              <el-icon>
                <VideoPlay/>
              </el-icon>
            </el-button>
          </div>
          <!--译文-->
          <div class="translation-line message"
               :class="{ 'show-translation': showBasicsTranslation }">
            {{ item.translation }}
          </div>
        </el-form-item>
      </el-form>
    </section>

    <!-- 普通对话 -->
    <section v-if="lessonStore.currentLesson.conversations?.length" class="section conversation-section">
      <el-form label-width="auto" v-for="(exchange, exchangeIndex) in lessonStore.currentLesson.conversations"
               :key="`exchange2-${exchangeIndex}`" class="conversation-exchange">

        <el-form-item :label="message.speaker" class="message" :class="[ `speaker-${message.speaker}`]"
                      v-for="(message, messageIndex) in exchange" :key="`message2-${exchangeIndex}-${messageIndex}`">
          <div>
            <!--原文-->
            <el-text class="text text-content"
                     :class="{'speaking-active': speakingActive(message.time, currentTime)}"
                     v-html="textHandler(message.content)" @click="handleAnchorClick"></el-text>
            <el-button
                type="primary"
                size="small"
                circle
                v-if="message.time"
                @click="playAudio(`${lessonStore.currentLesson.audio}${message.time}`)">
              <el-icon>
                <VideoPlay/>
              </el-icon>
            </el-button>
            <el-button v-else circle type="primary" size="small" :disabled="speechStore.isSpeaking"
                       @click="speechStore.speak(speakText(message.content))">
              <el-icon>
                <VideoPlay/>
              </el-icon>
            </el-button>
          </div>
          <!--译文-->
          <div class="translation-line message"
               :class="{ 'show-translation': showExchangeTranslations[exchangeIndex] }">
            {{
              message.translation
            }}
          </div>
        </el-form-item>
      </el-form>
    </section>

    <!-- 情景对话 -->
    <section v-if="lessonStore.currentLesson.conversations2?.length" class="section conversation-section">
      <h2>
        <el-text class="text text-content-h2" v-html="textHandler(lessonStore.currentLesson.title2.content)"
                 @click="handleAnchorClick"></el-text>
      </h2>
      <el-form label-width="auto" v-for="(exchange, exchangeIndex) in lessonStore.currentLesson.conversations2"
               :key="`exchange2-${exchangeIndex}`" class="conversation-exchange">
        <el-form-item :label="message.speaker" class="message" :class="[ `speaker-${message.speaker}`]"
                      v-for="(message, messageIndex) in exchange" :key="`message2-${exchangeIndex}-${messageIndex}`">
          <div>
            <!--原文-->
            <el-text class="text text-content"
                     :class="{'speaking-active': speakingActive(message.time, currentTime)}"
                     v-html="textHandler(message.content)" @click="handleAnchorClick"></el-text>
            <el-button
                type="primary"
                size="small"
                circle
                v-if="message.time"
                @click="playAudio(`${lessonStore.currentLesson.audio}${message.time}`)">
              <el-icon>
                <VideoPlay/>
              </el-icon>
            </el-button>
            <el-button v-else circle type="primary" size="small" :disabled="speechStore.isSpeaking"
                       @click="speechStore.speak(speakText(message.content))">
              <el-icon>
                <VideoPlay/>
              </el-icon>
            </el-button>
          </div>
          <!--译文-->
          <div class="translation-line message"
               :class="{ 'show-translation': showExchange2Translations[exchangeIndex] }">
            {{
              message.translation
            }}
          </div>
        </el-form-item>
      </el-form>
    </section>

    <!-- 单词 -->
    <section class="section words-section">
      <el-table :data="words">
        <el-table-column label="单词">
          <template #default="scope">
            <div :id="`word-${scope.row.word}`" class="column-word"
                 :class="{'speaking-active': speechStore.isTextSpeaking(scope.row.kana)}">{{ scope.row.word }}
            </div>
            <div :id="`word-${scope.row.kana}`" class="column-kana"
                 :class="{'speaking-active': speechStore.isTextSpeaking(scope.row.kana)}">{{ scope.row.kana }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="desc" label="释义"/>
        <el-table-column label="" width="50" v-if="baseSettingStore.speak">
          <template #header>
            <el-button
                type="primary"
                size="small"
                circle
                v-if="baseSettingStore.speak"
                :disabled="speechStore.isSpeaking"
                @click="speechStore.speakList(speakTextList(words.map(w => w.kana)))">
              <el-icon>
                <VideoPlay/>
              </el-icon>
            </el-button>
          </template>
          <template #default="scope">
            <el-button
                type="primary"
                size="small"
                circle
                :disabled="speechStore.isSpeaking"
                @click="speechStore.speak(scope.row.kana)">
              <el-icon>
                <VideoPlay/>
              </el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>

    <a class="go-top" href="#" @click="goTop">↑</a>
  </div>

  <audio ref="audioRef" :src="src" autoplay @timeupdate="onTimeUpdate"></audio>
</template>

<script setup lang="ts">
import {VideoPlay, Switch,} from '@element-plus/icons-vue'
import {computed, nextTick, onBeforeUnmount, ref, watch} from 'vue'
import {useLessonStore} from '../stores/lessonStore'
import {useSpeechStore} from "../stores/speechStore"
import {useBaseSettingStore} from "../stores/baseSettingStore"
import {useWordStore} from "../stores/wordStore"

const lessonStore = useLessonStore()
const speechStore = useSpeechStore()
const wordStore = useWordStore()
const baseSettingStore = useBaseSettingStore()

const showAllTranslations = ref(false)
const showBasicsTranslation = ref(false)
const showExchangeTranslations = ref<boolean[]>(new Array(100).fill(false))
const showExchange2Translations = ref<boolean[]>(new Array(100).fill(false))

const audioRef = ref<HTMLAudioElement>()
const src = ref<string>()
const currentTime = ref(0)

const playAudio = async (url: string) => {
  if (!url) {
    return
  }
  src.value = ""
  await nextTick()
  src.value = url
}

const container = ref()
const top = ref()
const lastElement = ref<HTMLElement | null>()

// 全局切换
const toggleAllTranslations = (newValue: boolean) => {
  showAllTranslations.value = newValue
  // 基础句子
  showBasicsTranslation.value = showAllTranslations.value
  // 简单对话
  for (let i = 0; i < showExchangeTranslations.value.length; i++) {
    showExchangeTranslations.value[i] = showAllTranslations.value
  }
  // 情景对话
  for (let i = 0; i < showExchange2Translations.value.length; i++) {
    showExchange2Translations.value[i] = showAllTranslations.value
  }
}

watch(() => baseSettingStore.translate, (value, _) => {
  if (!value) {
    // 设置中关闭翻译功能时
    toggleAllTranslations(false)
  }
})

watch(() => speechStore.speakingText, (value) => {
  let id = `#word-${value}`
  if (kanaWordMap.value.has(value)) {
    id = `#word-${kanaWordMap.value.get(value)}`
  }
  container.value.querySelector(id)?.scrollIntoView({
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
  if (audioRef.value) {
    currentTime.value = audioRef.value.currentTime; // 获取当前播放位置（秒）
  }
}

const speakingActive = (timeStr: string, currentTime: number): boolean => {
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

const words = computed(() => {
  return wordStore.getByLesson(lessonStore.currentIndex + 1)
})

const kanaWordMap = computed(() => {
  const map = new Map()
  words.value.forEach(item => {
    map.set(item.kana, item.word)
  })
  return map
})

const wordRegEx = computed(() => {
  let wordCopy = words.value.slice()
  wordCopy.sort((a, b) => b.word.length - a.word.length)
  return new RegExp(wordCopy.map(word => word.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g');
})

const highlightReplacer = (match: string) => match ? `<a href="#word-${match}" class="highlight-word">${match}</a>` : ''

const speakText = (text: string | undefined = "") => text.replace(/![^\(]+\(([^\)]+)\)/g, '$1')
const speakTextList = (arr: string[] = []) => arr.map(speakText)
const getDisplayText = (text: string | undefined = "") => text.replace(/!([^\(]+)\([^\)]+\)/g, '$1')
const textHandler = (originalText: string | undefined = "") => {
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
      if (textPart) {
        for (const [kanji, kana] of Object.entries(rubyMap)) {
          textPart = textPart.replace(new RegExp(`${kanji}(?!([^<]*<rt>)[^<]*<\\/rt>)`, "g"), `<ruby>${kanji}<rt>${kana}</rt></ruby>`)
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
    lastElement.value.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
    })
    lastElement.value?.classList.add("target-active");
    lastElement.value?.addEventListener("animationend", () => {
      lastElement.value?.classList.remove("target-active");
      lastElement.value = null
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

</script>

<style scoped>
.lesson-header-container {
  overflow-y: scroll;
}

.lesson-header {
  margin: 0 auto;
  padding: 10px 0;
  text-align: center;
  max-width: var(--content-max-width);
}

.lesson-container {
  overflow: auto;
  margin: 0 auto;
  padding-bottom: 120px;
  height: calc(100vh - 100px);
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

.lesson-title, .basics-section, .conversation-section {
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

:deep(.message .el-form-item__label) {
  font-weight: bolder;
  color: var(--el-text-color-regular);
  user-select: none;
  white-space: nowrap;
}

:deep(.message .el-form-item__content) {
  display: flex;
  flex-direction: column;
  align-items: start;
}

.column-word {
  font-size: 1.2rem;
}

:deep(.target-active) {
  animation: highlight 5s ease-in-out alternate;
}

@keyframes highlight {
  0%, 20%, 40%, 60%, 80% {
    color: #ff5500;
  }
  10%, 30%, 50%, 70%, 90% {
    color: #ffff00;
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
  bottom: 15%;
  right: 15%;
  width: 30px;
  height: 30px;
  border: 1px solid #aaa;
  border-radius: 50%;
  line-height: 25px;
  text-align: center;
  user-select: none;
  z-index: 999;
  color-scheme: inherit;
  font-weight: bolder;
  font-size: 1.5rem;
  color: inherit;
  background-color: inherit;
}

.speaking-active {
  color: var(--el-color-success);
}
</style>