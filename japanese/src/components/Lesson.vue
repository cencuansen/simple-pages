<template>
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
          :label="`${index + 1} ${getDisplayText(item.title?.content)}`"
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

  <div ref="container" class="lesson-container" v-if="lessonStore.currentLesson">
    <h1 class="lesson-index">
      <el-text class="text text-title-index">第 {{ lessonStore.currentIndex + 1 }} 課</el-text>
      <span v-if="baseSettingStore.translate" style="display: flex;align-items: center">&nbsp;
        <el-button
            type="primary"
            size="small"
            circle
            @click="toggleAllTranslations">
        <el-icon>
          <Switch/>
        </el-icon>
      </el-button>
</span>
    </h1>
    <h1 class="lesson-title">
      <el-text class="text text-title" v-html="textHandler(lessonStore.currentLesson.title?.content)"></el-text>
    </h1>

    <!-- 简单句子 -->
    <section v-if="lessonStore.currentLesson.basics?.length" class="section basics-section">
      <el-form class="basics-list">
        <el-form-item class="message" v-for="(item, idx) in lessonStore.currentLesson.basics" :key="`basic-${idx}`">
          <div>
            <el-text class="text text-content"
                     :class="{'speaking-active': speechStore.isTextSpeaking(speakText(item?.content))}"
                     v-html="textHandler(item.content)"></el-text>
            <el-button
                type="primary"
                size="small"
                circle
                v-if="baseSettingStore.speak"
                @click="playAudio(item.audio)">
              <el-icon>
                <VideoPlay/>
              </el-icon>
            </el-button>
          </div>
          <div class="translation-line message"
               :class="{ 'show-translation': showBasicsTranslation }">
            {{ lessonStore.currentLesson.translation?.basics?.[idx] || '' }}
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
            <el-text class="text text-content"
                     :class="{'speaking-active': speechStore.isTextSpeaking(speakText(message.content))}"
                     v-html="textHandler(message.content)"></el-text>
            <el-button
                type="primary"
                size="small"
                circle
                v-if="baseSettingStore.speak"
                @click="playAudio(message.audio)">
              <el-icon>
                <VideoPlay/>
              </el-icon>
            </el-button>
          </div>
          <div class="translation-line message"
               :class="{ 'show-translation': showExchangeTranslations[exchangeIndex] }">
            {{
              lessonStore.currentLesson.translation?.conversations?.[exchangeIndex][messageIndex]?.content || ''
            }}
          </div>
        </el-form-item>
      </el-form>
    </section>

    <!-- 情景对话 -->
    <section v-if="lessonStore.currentLesson.conversations2?.length" class="section conversation-section">
      <h2>
        <el-text class="text text-content-h2" v-html="textHandler(lessonStore.currentLesson.title2.content)"></el-text>
      </h2>
      <el-form label-width="auto" v-for="(exchange, exchangeIndex) in lessonStore.currentLesson.conversations2"
               :key="`exchange2-${exchangeIndex}`" class="conversation-exchange">
        <el-form-item :label="message.speaker" class="message" :class="[ `speaker-${message.speaker}`]"
                      v-for="(message, messageIndex) in exchange" :key="`message2-${exchangeIndex}-${messageIndex}`">
          <div>
            <el-text class="text text-content"
                     :class="{'speaking-active': speechStore.isTextSpeaking(speakText(message.content))}"
                     v-html="textHandler(message.content)"></el-text>
            <el-button
                type="primary"
                size="small"
                circle
                v-if="baseSettingStore.speak"
                @click="playAudio(message.audio)">
              <el-icon>
                <VideoPlay/>
              </el-icon>
            </el-button>
          </div>
          <div class="translation-line message"
               :class="{ 'show-translation': showExchange2Translations[exchangeIndex] }">
            {{
              lessonStore.currentLesson.translation?.conversations2?.[exchangeIndex]?.filter(x => x.speaker !== "旁白")[messageIndex]?.content || ''
            }}
          </div>
        </el-form-item>
      </el-form>
    </section>

    <!-- 单词 -->
    <section class="section words-section">
      <h2>单词</h2>
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
      <el-table :data="words">
        <el-table-column label="假名">
          <template #default="scope">
            <div :id="`word-${scope.row.word}`" class="column-word"
                 :class="{'speaking-active': speechStore.isTextSpeaking(scope.row.kana)}">{{ scope.row.word }}
            </div>
            <div class="column-kana"
                 :class="{'speaking-active': speechStore.isTextSpeaking(scope.row.kana)}">{{ scope.row.kana }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="desc" label="释义"/>
        <el-table-column label="" width="50" v-if="baseSettingStore.speak">
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

  <audio ref="audioRef" :src="src" autoplay></audio>
</template>

<script setup lang="ts">
import {VideoPlay, Switch,} from '@element-plus/icons-vue'
import {computed, onBeforeUnmount, ref} from 'vue'
import type {Text} from '../stores/lessonStore'
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
const src = ref<string>("")
const playAudio = (url: string) => {
  if (!url) {
    return
  }
  const part = url.split("#")
  src.value = `${part[0]}?${new Date().getTime()}#${part[1]}`
}

// 全局切换
const toggleAllTranslations = () => {
  showAllTranslations.value = !showAllTranslations.value
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

// 简单对话整体切换
const toggleConversationTranslations = () => {
  const newValue = !showExchangeTranslations.value.every(x => x)
  for (let i = 0; i < showExchangeTranslations.value.length; i++) {
    showExchangeTranslations.value[i] = newValue
  }
}

// 情景对话整体切换
const toggleConversation2Translations = () => {
  const newValue = !showExchange2Translations.value.every(x => x)
  for (let i = 0; i < showExchange2Translations.value.length; i++) {
    showExchange2Translations.value[i] = newValue
  }
}

// 简单对话切换
const toggleExchangeTranslation = (index: number) => {
  showExchangeTranslations.value[index] = !showExchangeTranslations.value[index]
}

// 情景对话切换
const toggleExchange2Translation = (index: number) => {
  showExchange2Translations.value[index] = !showExchange2Translations.value[index]
}

const goToLesson = async (index: number) => {
  lessonStore.setCurrentIndex(index)
}

const words = computed(() => {
  return wordStore.getByLesson(lessonStore.currentIndex + 1)
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

const convMap = (co: Text[]) => co.map(x => x.content)
const convFlatMap = (conv: Text[][]) => conv.flatMap(convMap)

const container = ref()
const goTop = () => {
  container.value.scrollTop = 0
}

onBeforeUnmount(() => {
  speechStore.stop()
})

</script>

<style scoped>
.lesson-header {
  margin: 0 auto;
  padding: 10px 0;
  text-align: center;
  max-width: var(--content-max-width);
}

.lesson-container {
  overflow: auto;
  margin: 0 auto;
  padding: 0 10px 120px;
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

.lesson-index {
  display: flex;
  align-items: center;
  justify-content: center;
}

.lesson-title {
  margin: 10px auto 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.text-title-index, .text-title {
  font-size: 1.5rem;
}

.speaking-active {
  color: var(--el-color-success);
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
  font-size: 1.3rem;
}

.text-content {
  font-size: 1rem;
}

:deep(.function-group) {
  margin-bottom: 10px;
  display: flex;
}

.section {
  margin-bottom: 40px;
}

.original-line {
  display: flex;
  align-items: start;
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

.conversation-exchange {
  margin-bottom: 10px;
  border-left: 1px solid #aaa;
  padding-left: 10px;
}

.basics-section {
  border-left: 1px solid #aaa;
  padding-left: 10px;
}

.lesson-container .el-form-item {
  margin-bottom: 0;
}

.speaker-label, :deep(.message .el-form-item__label) {
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

.speaker-旁白 {
  font-size: .8em;
  color: #888;
  user-select: none;
}

.column-word {
  font-size: 1.2rem;
}

.column-word:target {
  animation: highlight 7s ease-in-out alternate;
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

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
}

.error-container {
  text-align: center;
  padding: 20px;
}

.error-container .el-alert {
  margin-bottom: 20px;
}

.go-top {
  position: absolute;
  bottom: 5%;
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
</style>