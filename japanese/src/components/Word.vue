<template>
  <div class="lesson-header navigation-buttons">
    <el-button
        size="small"
        class="previous-button navigation-item"
        :disabled="!currentIndex || currentIndex === 1"
        @click="goToLesson(currentIndex - 1)"
    >
      上一课
    </el-button>
    <el-select size="small" class="navigation-item" v-model="currentIndex" fit-input-width clearable
               placeholder="选课程">
      <el-option
          v-for="index in wordStore.lessonCount"
          :key="index"
          :label="`第 ${index} 课`"
          :value="index"
      />
    </el-select>
    <el-input v-model="keyword" size="small" placeholder="搜单词" clearable></el-input>
    <el-button
        size="small"
        class="next-button navigation-item"
        :disabled="!currentIndex || currentIndex === wordStore.lessonCount"
        @click="goToLesson(currentIndex + 1)"
    >
      下一课
    </el-button>
  </div>
  <div ref="container" class="lesson-container">
    <!-- 单词 -->
    <section class="section words-section">
      <el-button
          type="primary"
          size="small"
          circle
          :disabled="!currentIndex || speechStore.isSpeaking"
          @click="speechStore.speakList(getSpeechTextList(words.map(w => w.kana)))">
        <el-icon>
          <VideoPlay/>
        </el-icon>
      </el-button>
      <el-table :data="words">
        <el-table-column label="假名" show-overflow-tooltip>
          <template #default="scope">
            <div :id="`word-${scope.row.word}`" class="column-word">{{ scope.row.word }}</div>
            <div class="column-kana">{{ scope.row.kana }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="desc" label="释义" width="200" show-overflow-tooltip/>
        <el-table-column label="" width="40" v-if="!currentIndex" show-overflow-tooltip>
          <template #default="scope">
            {{ wordStore.realLessonNumber(scope.row.lesson) }}
          </template>
        </el-table-column>
        <el-table-column label="" width="50">
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
</template>

<script setup lang="ts">
import {VideoPlay} from '@element-plus/icons-vue'
import {computed, onBeforeUnmount, ref} from 'vue'
import {useSpeechStore} from "../stores/speechStore"
import {useWordStore, type WordItem} from "../stores/wordStore"

const speechStore = useSpeechStore()
const wordStore = useWordStore()

const currentIndex = ref()
const maxPageSize = ref(0)
const keyword = ref("")

const goToLesson = async (index: number) => {
  currentIndex.value = index
  return wordStore.getByLesson(index)
}

const words = computed(() => {
  let list: WordItem[] = []
  if (currentIndex.value) {
    list = wordStore.getByLesson(currentIndex.value)
    maxPageSize.value = list.length
  } else {
    list = wordStore.wordList
    maxPageSize.value = 100
  }
  if (keyword.value) {
    list = list.filter(item => item.kana.indexOf(keyword.value) > -1
        || item.kanji.indexOf(keyword.value) > -1
        || item.desc.indexOf(keyword.value) > -1
        || item.word.indexOf(keyword.value) > -1
    )
  }
  return list.slice(0, maxPageSize.value)
})

const getSpeechText = (text: string | undefined = "") => text.replace(/![^\(]+\(([^\)]+)\)/g, '$1')
const getSpeechTextList = (arr: string[] = []) => arr.map(getSpeechText)

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
  display: flex;
  margin: 0 auto;
  padding: 10px 0;
  text-align: center;
  max-width: var(--content-max-width);
}

.lesson-header > * {
  margin-right: 10px;
}

.lesson-header > *:last-child {
  margin-right: 0;
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