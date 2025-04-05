<template>
  <div ref="container" class="lesson-container" v-if="lessonStore.currentLesson">
    <div class="lesson-header">
      <div class="navigation-buttons">
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
      <h1 class="lesson-index">第 {{ lessonStore.currentIndex + 1 }} 課</h1>
      <h1 class="lesson-title">
        <span v-html="highlightText(lessonStore.currentLesson.title)"></span>
        <el-button
            type="primary"
            size="small"
            circle
            :disabled="speechStore.isSpeaking"
            @click="speechStore.speak(lessonStore.currentLesson.title||'')">
          <el-icon>
            <VideoPlay/>
          </el-icon>
        </el-button>
      </h1>
    </div>

    <section v-if="lessonStore.currentLesson.basics?.length" class="section basics-section">
      <div class="speak-list">
        <el-button
            type="primary"
            size="small"
            circle
            :disabled="speechStore.isSpeaking"
            @click="speechStore.speakList(lessonStore.currentLesson.basics)">
          <el-icon>
            <VideoPlay/>
          </el-icon>
        </el-button>
      </div>
      <ul class="basics-list">
        <li v-for="(item, idx) in lessonStore.currentLesson.basics" :key="`basic-${idx}`">
          <span v-html="highlightText(item)"></span>
          <el-button
              type="primary"
              size="small"
              circle
              :disabled="speechStore.isSpeaking"
              @click="speechStore.speak(item)">
            <el-icon>
              <VideoPlay/>
            </el-icon>
          </el-button>
        </li>
      </ul>
    </section>

    <section v-if="lessonStore.currentLesson.conversations?.length" class="section conversation-section">
      <div class="speak-list">
        <el-button
            type="primary"
            size="small"
            circle
            :disabled="speechStore.isSpeaking"
            @click="speechStore.speakList(convFlatMap(lessonStore.currentLesson.conversations))">
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
              :disabled="speechStore.isSpeaking"
              @click="speechStore.speakList(convMap(exchange))">
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
          <span class="speaker-label">{{ message.speaker }}：</span>
          <span class="message-content" v-html="highlightText(message.content)"></span>
          <el-button
              type="primary"
              size="small"
              circle
              :disabled="speechStore.isSpeaking"
              @click="speechStore.speak(message.content)">
            <el-icon>
              <VideoPlay/>
            </el-icon>
          </el-button>
        </div>
      </div>
    </section>

    <section v-if="lessonStore.currentLesson.conversations2?.length" class="section conversation-section">
      <h2>{{ lessonStore.currentLesson.title2 }}</h2>
      <div class="speak-list">
        <el-button
            type="primary"
            size="small"
            circle
            :disabled="speechStore.isSpeaking"
            @click="speechStore.speakList(convFlatMap(lessonStore.currentLesson.conversations2))">
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
              :disabled="speechStore.isSpeaking"
              @click="speechStore.speakList(convMap(exchange))">
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
          <span class="speaker-label">{{ message.speaker }}：</span>
          <span class="message-content" v-html="highlightText(message.content)"></span>
          <el-button
              type="primary"
              size="small"
              circle
              :disabled="speechStore.isSpeaking"
              @click="speechStore.speak(message.content)">
            <el-icon>
              <VideoPlay/>
            </el-icon>
          </el-button>
        </div>
      </div>
    </section>

    <h1>译文</h1>

    <section v-if="lessonStore.currentLesson.translation?.basics" class="section basics-section">
      <ul class="basics-list">
        <li v-for="(item, idx) in lessonStore.currentLesson.translation.basics" :key="`basic-${idx}`">
          {{ item }}
        </li>
      </ul>
    </section>

    <section v-if="lessonStore.currentLesson.translation.conversations?.length" class="section conversation-section">
      <div
          v-for="(exchange, exchangeIndex) in lessonStore.currentLesson.translation.conversations"
          :key="`exchange-${exchangeIndex}`"
          class="conversation-exchange"
      >
        <div
            v-for="(message, messageIndex) in exchange"
            :key="`message-${exchangeIndex}-${messageIndex}`"
            :class="['message', `speaker-${message.speaker}`]"
        >
          <span class="speaker-label">{{ message.speaker }}：</span>
          <span class="message-content">{{ message.content }}</span>
        </div>
      </div>
    </section>

    <section v-if="lessonStore.currentLesson.translation.conversations2?.length" class="section conversation-section">
      <h2>{{ lessonStore.currentLesson.translation.title2 }}</h2>
      <div
          v-for="(exchange, exchangeIndex) in lessonStore.currentLesson.translation.conversations2"
          :key="`exchange2-${exchangeIndex}`"
          class="conversation-exchange"
      >
        <div
            v-for="(message, messageIndex) in exchange"
            :key="`message2-${exchangeIndex}-${messageIndex}`"
            :class="['message', `speaker-${message.speaker}`]"
        >
          <span class="speaker-label" v-if="message.speaker !== '旁白'">{{ message.speaker }}：</span>
          <span class="message-content">{{ message.content }}</span>
        </div>
      </div>
    </section>

    <section class="section words-section">
      <h2>单词</h2>
      <el-button
          type="primary"
          size="small"
          circle
          :disabled="speechStore.isSpeaking"
          @click="speechStore.speakList(words.map(w => w.kana))">
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
                @click="speechStore.speak(scope.row.kana||'')">
              <el-icon>
                <VideoPlay/>
              </el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>

    <div class="navigation-buttons">
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

    <a class="go-top" href="#" @click="goTop">↑</a>
  </div>

  <!-- 加载状态 -->
  <div v-else-if="lessonStore.isLoading" class="loading-container">
    <el-icon class="is-loading" :size="30">
      <Loading/>
    </el-icon>
    <span>加载中...</span>
  </div>

  <!-- 错误状态 -->
  <div v-else-if="lessonStore.error" class="error-container">
    <el-alert
        :title="`加载失败: ${lessonStore.error}`"
        type="error"
        show-icon
    />
    <el-button @click="lessonStore.fetchLessons()">
      重新加载
    </el-button>
  </div>
</template>

<script setup lang="ts">
import {Loading, VideoPlay} from '@element-plus/icons-vue'
import {computed, onBeforeUnmount, ref} from 'vue'
import type {Conversations} from '../stores/lessonStore'
import {useLessonStore} from '../stores/lessonStore'
import {useSpeechStore} from "../stores/speechStore"
import {useWordStore} from "../stores/wordStore"

const lessonStore = useLessonStore()
const speechStore = useSpeechStore()
const wordStore = useWordStore()

const goToLesson = async (index: number) => {
  lessonStore.setCurrentIndex(index)
}

const words = computed(() => {
  return wordStore.getByLesson(lessonStore.currentIndex + 1)
})

const convMap = (co: Conversations[]) => co.map(x => x.content)
const convFlatMap = (conv: Conversations[][]) => conv.flatMap(convMap)

const highlightText = (text: string | undefined = "") => {
  if (!text) return
  let wordCopy = words.value.slice()
  wordCopy.sort((a, b) => b.word.length - a.word.length)
  let patten = new RegExp(wordCopy.map(word => word.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g');
  return text.replace(patten, match => `<a href="#word-${match}" class="highlight-word">${match}</a>`)
}

const container = ref()
const goTop = () => {
  // container.value.scrollIntoView({behavior: 'smooth'})
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
.lesson-container {
  margin: 0 auto;
  padding: 0 10px 120px;
}

.lesson-header {
  text-align: center;
  margin-bottom: 30px;
}

.navigation-item {
  margin-right: 20px;
}

.navigation-item:last-child {
  margin-right: 0;
}

.lesson-index {
  margin: 10px 0;
}

.lesson-title {
  margin: 0;
}

.speak-list {
  margin-bottom: 10px;
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
  margin-right: 5px;
  user-select: none;
}

.speaker-旁白 {
  font-size: .8em;
  color: #888;
  user-select: none;
}

.translation-section {
  padding: 20px;
  border-radius: 8px;
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
  right: 5%;
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