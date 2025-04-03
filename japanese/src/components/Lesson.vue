<template>
  <div class="lesson-container" v-if="lessonStore.currentLesson">
    <div class="lesson-header">
      <div class="navigation-buttons">
        <el-button
            class="previous-button"
            :disabled="!lessonStore.hasPrevious"
            @click="goToLesson(lessonStore.currentIndex - 1)"
        >
          上一课
        </el-button>
        <el-button
            class="next-button"
            :disabled="!lessonStore.hasNext"
            @click="goToLesson(lessonStore.currentIndex + 1)"
        >
          下一课
        </el-button>
      </div>
      <span class="lesson-index">第{{ lessonStore.currentIndex + 1 }}课</span>
      <h1 class="lesson-title">
        {{ lessonStore.currentLesson.title }}
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
      <h2>基础知识</h2>
      <ul class="basics-list">
        <li v-for="(item, idx) in lessonStore.currentLesson.basics" :key="`basic-${idx}`">
          {{ item }}
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
      <h2>{{ lessonStore.currentLesson.title2 || '对话练习' }}</h2>
      <div
          v-for="(exchange, exchangeIndex) in lessonStore.currentLesson.conversations"
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
      <h2>{{ lessonStore.currentLesson.title2 || '进阶对话' }}</h2>
      <div
          v-for="(exchange, exchangeIndex) in lessonStore.currentLesson.conversations2"
          :key="`exchange2-${exchangeIndex}`"
          class="conversation-exchange"
      >
        <div
            v-for="(message, messageIndex) in exchange"
            :key="`message2-${exchangeIndex}-${messageIndex}`"
            :class="['message', `speaker-${message.speaker}`]"
        >
          <span class="speaker-label">{{ message.speaker }}：</span>
          <span class="message-content">{{ message.content }}</span>
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

    <!-- 翻译部分 -->
    <h1>翻译</h1>
    <br>

    <section v-if="lessonStore.currentLesson.translation?.basics" class="section basics-section">
      <h2>基础知识</h2>
      <ul class="basics-list">
        <li v-for="(item, idx) in lessonStore.currentLesson.translation.basics" :key="`basic-${idx}`">
          {{ item }}
        </li>
      </ul>
    </section>

    <section v-if="lessonStore.currentLesson.translation.conversations?.length" class="section conversation-section">
      <h2>{{ lessonStore.currentLesson.translation.title2 || '对话练习' }}</h2>
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
      <h2>{{ lessonStore.currentLesson.translation.title2 || '进阶对话' }}</h2>
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

    <!-- 翻译部分 -->

    <div class="navigation-buttons">
      <el-button
          class="previous-button"
          :disabled="!lessonStore.hasPrevious"
          @click="goToLesson(lessonStore.currentIndex - 1)"
      >
        上一课
      </el-button>
      <el-button
          class="next-button"
          :disabled="!lessonStore.hasNext"
          @click="goToLesson(lessonStore.currentIndex + 1)"
      >
        下一课
      </el-button>
    </div>
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
import {useLessonStore} from '../stores/lessonStore'
import {Loading, VideoPlay} from '@element-plus/icons-vue'
import {useSpeechStore} from "../stores/speechStore.ts";

const lessonStore = useLessonStore()
const speechStore = useSpeechStore()

const goToLesson = async (index: number) => {
  lessonStore.setCurrentIndex(index)
}

// 自动加载数据（如果尚未加载）
if (lessonStore.lessons.length === 0 && !lessonStore.isLoading) {
  lessonStore.fetchLessons()
}
</script>

<style scoped>
.lesson-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.lesson-header {
  text-align: center;
  margin-bottom: 30px;
}

.lesson-index {
  display: block;
  font-size: 1.2em;
  margin-bottom: 10px;
}

.lesson-title {
  margin: 0;
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
</style>