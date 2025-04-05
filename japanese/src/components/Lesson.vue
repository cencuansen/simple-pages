<template>
  <div class="lesson-header navigation-buttons">
    <el-button
        class="previous-button navigation-item"
        :disabled="!lessonStore.hasPrevious"
        @click="goToLesson(lessonStore.currentIndex - 1)"
    >
      上一课
    </el-button>
    <el-select class="navigation-item" v-model="lessonStore.currentIndex">
      <el-option
          v-for="(item, index) in lessonStore.lessons"
          :key="item.title"
          :label="`第 ${index + 1} 課 - ${item.title}`"
          :value="index"
      />
    </el-select>
    <el-button
        class="next-button navigation-item"
        :disabled="!lessonStore.hasNext"
        @click="goToLesson(lessonStore.currentIndex + 1)"
    >
      下一课
    </el-button>
  </div>
  <div ref="container" class="lesson-container" v-if="lessonStore.currentLesson">
    <h1 class="lesson-index">
      <span>第 {{ lessonStore.currentIndex + 1 }} 課</span>
      &nbsp;
      <el-button
          type="primary"
          size="small"
          circle
          @click="toggleAllTranslations">
        <el-icon>
          <Switch/>
        </el-icon>
      </el-button>
    </h1>
    <h1 class="lesson-title">
      <span v-html="highlightWord(lessonStore.currentLesson.title)"></span>
    </h1>

    <!-- 简单句子 -->
    <section v-if="lessonStore.currentLesson.basics?.length" class="section basics-section">
      <div class="speak-list">
        <el-button
            type="primary"
            size="small"
            circle
            @click="showBasicsTranslation = !showBasicsTranslation">
          <el-icon>
            <Switch/>
          </el-icon>
        </el-button>
        <el-button
            type="primary"
            size="small"
            circle
            :disabled="speechStore.isSpeaking"
            @click="speechStore.speakList(speakListTextReplace(lessonStore.currentLesson.basics))">
          <el-icon>
            <VideoPlay/>
          </el-icon>
        </el-button>
      </div>
      <ul class="basics-list">
        <li v-for="(item, idx) in lessonStore.currentLesson.basics" :key="`basic-${idx}`">
          <div class="original-line">
            <span v-html="highlightWord(item)"></span>
            <el-button
                type="primary"
                size="small"
                circle
                :disabled="speechStore.isSpeaking"
                @click="speechStore.speak(speakTextReplace(item))">
              <el-icon>
                <VideoPlay/>
              </el-icon>
            </el-button>
          </div>
          <div class="translation-line" :class="{ 'show-translation': showBasicsTranslation }">
            {{ lessonStore.currentLesson.translation?.basics?.[idx] || '' }}
          </div>
        </li>
      </ul>
    </section>

    <!-- 普通对话 -->
    <section v-if="lessonStore.currentLesson.conversations?.length" class="section conversation-section">
      <div class="speak-list">
        <el-button
            type="primary"
            size="small"
            circle
            @click="toggleConversationTranslations">
          <el-icon>
            <Switch/>
          </el-icon>
        </el-button>
        <el-button
            type="primary"
            size="small"
            circle
            :disabled="speechStore.isSpeaking"
            @click="speechStore.speakList(speakListTextReplace(convFlatMap(lessonStore.currentLesson.conversations)))">
          <el-icon>
            <VideoPlay/>
          </el-icon>
        </el-button>
      </div>
      <div
          v-for="(exchange, exchangeIndex) in lessonStore.currentLesson.conversations"
          :key="`exchange-${exchangeIndex}`"
          class="conversation-exchange"
      >
        <div class="speak-list">
          <el-button
              type="primary"
              size="small"
              circle
              @click="toggleExchangeTranslation(exchangeIndex)">
            <el-icon>
              <Switch/>
            </el-icon>
          </el-button>
          <el-button
              type="primary"
              size="small"
              circle
              :disabled="speechStore.isSpeaking"
              @click="speechStore.speakList(speakListTextReplace(convMap(exchange)))">
            <el-icon>
              <VideoPlay/>
            </el-icon>
          </el-button>
        </div>
        <div
            v-for="(message, messageIndex) in exchange"
            :key="`message-${exchangeIndex}-${messageIndex}`"
            :class="['message', `speaker-${message.speaker}`]"
        >
          <div class="original-line">
            <span class="speaker-label">{{ message.speaker }}：</span>
            <span class="message-content" v-html="highlightWord(message.content)"></span>
            <el-button
                type="primary"
                size="small"
                circle
                :disabled="speechStore.isSpeaking"
                @click="speechStore.speak(speakTextReplace(message.content))">
              <el-icon>
                <VideoPlay/>
              </el-icon>
            </el-button>
          </div>
          <div class="translation-line"
               :class="{ 'show-translation': showExchangeTranslations[exchangeIndex] }">
            {{ lessonStore.currentLesson.translation?.conversations?.[exchangeIndex]?.[messageIndex]?.content || '' }}
          </div>
        </div>
      </div>
    </section>

    <!-- 情景对话 -->
    <section v-if="lessonStore.currentLesson.conversations2?.length" class="section conversation-section">
      <h2>{{ lessonStore.currentLesson.title2 }}</h2>
      <div class="speak-list">
        <el-button
            type="primary"
            size="small"
            circle
            @click="toggleConversation2Translations">
          <el-icon>
            <Switch/>
          </el-icon>
        </el-button>
        <el-button
            type="primary"
            size="small"
            circle
            :disabled="speechStore.isSpeaking"
            @click="speechStore.speakList(speakListTextReplace(convFlatMap(lessonStore.currentLesson.conversations2)))">
          <el-icon>
            <VideoPlay/>
          </el-icon>
        </el-button>
      </div>
      <div
          v-for="(exchange, exchangeIndex) in lessonStore.currentLesson.conversations2"
          :key="`exchange2-${exchangeIndex}`"
          class="conversation-exchange"
      >
        <div class="speak-list">
          <el-button
              type="primary"
              size="small"
              circle
              @click="toggleExchange2Translation(exchangeIndex)">
            <el-icon>
              <Switch/>
            </el-icon>
          </el-button>
          <el-button
              type="primary"
              size="small"
              circle
              :disabled="speechStore.isSpeaking"
              @click="speechStore.speakList(speakListTextReplace(convMap(exchange)))">
            <el-icon>
              <VideoPlay/>
            </el-icon>
          </el-button>
        </div>
        <div
            v-for="(message, messageIndex) in exchange"
            :key="`message2-${exchangeIndex}-${messageIndex}`"
            :class="['message', `speaker-${message.speaker}`]"
        >
          <div class="original-line">
            <span class="speaker-label">{{ message.speaker }}：</span>
            <span class="message-content" v-html="highlightWord(message.content)"></span>
            <el-button
                type="primary"
                size="small"
                circle
                :disabled="speechStore.isSpeaking"
                @click="speechStore.speak(speakTextReplace(message.content))">
              <el-icon>
                <VideoPlay/>
              </el-icon>
            </el-button>
          </div>
          <div class="translation-line"
               :class="{ 'show-translation': showExchange2Translations[exchangeIndex] }">
            {{
              lessonStore.currentLesson.translation?.conversations2?.[exchangeIndex]?.filter(x => x.speaker !== "旁白")[messageIndex]?.content || ''
            }}
          </div>
        </div>
      </div>
    </section>

    <!-- 单词 -->
    <section class="section words-section">
      <h2>单词</h2>
      <el-button
          type="primary"
          size="small"
          circle
          :disabled="speechStore.isSpeaking"
          @click="speechStore.speakList(speakListTextReplace(words.map(w => w.kana)))">
        <el-icon>
          <VideoPlay/>
        </el-icon>
      </el-button>
      <el-table :data="words">
        <el-table-column label="假名">
          <template #default="scope">
            <div :id="`word-${scope.row.word}`" class="column-word">{{ scope.row.word }}</div>
            <div class="column-kana">{{ scope.row.kana }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="desc" label="释义"/>
        <el-table-column label="" width="50">
          <template #default="scope">
            <el-button
                type="primary"
                size="small"
                circle
                :disabled="speechStore.isSpeaking"
                @click="speechStore.speak(speakTextReplace(scope.row.kana))">
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
</template>

<script setup lang="ts">
import {VideoPlay, Switch} from '@element-plus/icons-vue'
import {computed, onBeforeUnmount, ref} from 'vue'
import type {Conversations} from '../stores/lessonStore'
import {useLessonStore} from '../stores/lessonStore'
import {useSpeechStore} from "../stores/speechStore"
import {useWordStore} from "../stores/wordStore"

const lessonStore = useLessonStore()
const speechStore = useSpeechStore()
const wordStore = useWordStore()

const showAllTranslations = ref(false)
const showBasicsTranslation = ref(false)
const showExchangeTranslations = ref<boolean[]>(new Array(100).fill(false))
const showExchange2Translations = ref<boolean[]>(new Array(100).fill(false))

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

const kanjiRexEx = /[\u4E00-\u9FFF\u3400-\u4DBF]/

const wordRegEx = computed(() => {
  let wordCopy = words.value.slice()
  wordCopy.sort((a, b) => b.word.length - a.word.length)
  return new RegExp(wordCopy.map(word => word.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g');
})

const convMap = (co: Conversations[]) => co.map(x => x.content)
const convFlatMap = (conv: Conversations[][]) => conv.flatMap(convMap)

const highlightWord = (text: string | undefined = "") => {
  return text.replace(wordRegEx.value, match => {
    if (kanjiRexEx.test(match)) {
      const kana = words.value.find(w => w.word === match)?.kana
      return `<a href="#word-${match}" class="highlight-word"><ruby>${match}<rt>${kana}</rt></ruby></a>`
    }
    return `<a href="#word-${match}" class="highlight-word">${match}</a>`
  })
}

const speakTextReplace = (text: string | undefined = "") => {
  // 目的：防止日语汉字读不准，将相关单词换成假名
  return text.replace(wordRegEx.value, match => words.value.find(w => w.word === match)?.kana || match)
}

const speakListTextReplace = (arr: string[] = []) => {
  // 目的：防止日语汉字读不准，将相关单词换成假名
  return arr.map(text => text.replace(wordRegEx.value, match => words.value.find(w => w.word === match)?.kana || match))
}

const container = ref()
const goTop = () => {
  container.value.scrollTop = 0
}

// 自动加载数据（如果尚未加载）
if (lessonStore.lessons.length === 0 && !lessonStore.isLoading) {
  lessonStore.fetchLessons()
}

onBeforeUnmount(() => {
  speechStore.stop()
})

</script>

<style scoped>
.lesson-header {
  text-align: center;
  margin-bottom: 10px;
  padding: 0 10px;
}

.lesson-container {
  overflow: auto;
  margin: 0 auto;
  padding: 0 10px 120px;
  height: calc(100vh - 100px);
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
  margin: 0 auto 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.speak-list {
  margin-bottom: 10px;
  display: flex;
  gap: 10px;
}

.section {
  margin-bottom: 40px;
}

.section h2 {
  border-bottom: 1px solid #aaa;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.basics-list {
  padding-left: 20px;
}

.basics-list li {
  margin-bottom: 10px;
  line-height: 1.6;
}

.original-line {
  display: flex;
  align-items: center;
  gap: 5px;
}

.translation-line {
  font-size: 0.85em;
  color: #999;
  padding-left: 20px;
  height: 1.2em;
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.translation-line.show-translation {
  visibility: visible;
  opacity: 1;
}

.conversation-exchange {
  margin-bottom: 25px;
  border: 1px solid #aaa;
  border-radius: 8px;
  padding: 15px;
}

.message {
  margin-bottom: 10px;
  line-height: 1.6;
}

.message:last-child {
  margin-bottom: 0;
}

.speaker-label {
  font-weight: bold;
  user-select: none;
  white-space: nowrap;
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

.el-button + .el-button {
  margin: 0;
}
</style>