<template>
  <div class="words">
    <div class="word-headers">
      <div class="word-header">
      <span><el-button
          size="small"
          class="previous-button navigation-item"
          :disabled="lessonIndex === 1 || (!lessonIndex && pageIndex === 1)"
          @click="goPrevious"
      >
        上一页
      </el-button></span>
        <el-select size="small" class="navigation-item" v-model="lessonIndex" fit-input-width clearable
                   placeholder="选课程">
          <el-option
              v-for="index in wordStore.lessonCount"
              :key="index"
              :label="`第 ${index} 课`"
              :value="index"
          />
        </el-select>
        <el-input v-model.trim="keyword" size="small" placeholder="搜单词" clearable></el-input>
        <span><el-button
            size="small"
            class="next-button navigation-item"
            :disabled="lessonIndex === maxPage || (!lessonIndex && pageIndex === maxPage)"
            @click="goNext"
        >
        下一页
      </el-button></span>
      </div>
    </div>

    <div class="word-main" ref="container" @scroll="containerOnScroll">
      <div ref="top"></div>
      <!-- 单词 -->
      <section class="section words-section">
        <el-table :data="words">
          <el-table-column label="单词">
            <template #default="scope">
              <div v-if="baseSettingStore.word" :id="speakingWordId(scope.row as WordItem)" class="column-word"
                   :class="{'speaking-active': speechStore.isWordSpeaking(scope.row)}">{{ scope.row.word }}
              </div>
              <div v-if="baseSettingStore.kana" class="column-kana"
                   :class="{'speaking-active': speechStore.isWordSpeaking(scope.row)}">{{ scope.row.kana }}
              </div>
            </template>
          </el-table-column>
          <el-table-column width="60" prop="pos" label="词性" show-overflow-tooltip/>
          <el-table-column prop="desc" label="释义" v-if="baseSettingStore.wordDesc" show-overflow-tooltip/>
          <el-table-column label="" width="50" v-if="!lessonIndex">
            <template #default="scope">
              {{ wordStore.realLessonNumber(scope.row.lesson) }}
            </template>
          </el-table-column>
          <el-table-column label="" width="50" v-if="baseSettingStore.ttsSpeak">
            <template #header>
              <el-button
                  type="primary"
                  size="small"
                  circle
                  v-if="baseSettingStore.ttsSpeak && lessonIndex"
                  :disabled="speechStore.isSpeaking"
                  @click="speechStore.speakList(words)">
                <el-icon>
                  <i class="icon-on-MPIS-TTS"></i>
                </el-icon>
              </el-button>
            </template>
            <template #default="scope">
              <el-button
                  type="primary"
                  size="small"
                  circle
                  :disabled="speechStore.isSpeaking"
                  @click="speechStore.speak(scope.row)">
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
  </div>
</template>

<script setup lang="ts">
import {computed, onActivated, onBeforeUnmount, ref, watch} from 'vue'
import {useSpeechStore} from "../stores/speechStore"
import {useBaseSettingStore} from "../stores/baseSettingStore"
import {useWordStore} from "../stores/wordStore"
import type {WordItem} from '../types'
import {speakingId, speakingWordId} from '../utils.ts'

const speechStore = useSpeechStore()
const wordStore = useWordStore()
const baseSettingStore = useBaseSettingStore()

const lessonIndex = ref()
const pageIndex = ref(1)
const keyword = ref("")

const maxPageSize = 20

const container = ref()
const scrollPosition = ref<number>(0)
const top = ref()

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

const goPrevious = async () => {
  if (lessonIndex.value) {
    lessonIndex.value--
  } else {
    pageIndex.value--
  }
}

const goNext = async () => {
  if (lessonIndex.value) {
    lessonIndex.value++
  } else {
    pageIndex.value++
  }
}

const maxPage = computed(() => {
  if (lessonIndex.value) {
    pageIndex.value = 1
    return wordStore.lessonCount
  }
  return Math.ceil(wordStore.wordList.length / maxPageSize)
})

const words = computed(() => {
  let list: WordItem[]
  let index
  let size
  if (lessonIndex.value) {
    list = wordStore.getByLesson(lessonIndex.value)
    index = 1
    size = list.length
  } else {
    list = wordStore.wordList
    index = pageIndex.value
    size = maxPageSize
  }
  if (keyword.value) {
    list = list.filter(item => item.kana.indexOf(keyword.value) > -1
        || item.kanji.indexOf(keyword.value) > -1
        || item.desc.indexOf(keyword.value) > -1
        || item.word.indexOf(keyword.value) > -1
    )
  }
  let skip = (index - 1) * size
  return list.slice(skip, index * size)
})

// const getSpeechText = (text: string | undefined = "") => text.replace(/![^(]+\(([^)]+)\)/g, '$1')
// const getSpeechTextList = (arr: string[] = []) => arr.map(getSpeechText)

const goTop = () => {
  top.value.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
    inline: 'nearest',
  })
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

</script>

<style scoped>
.words {
  width: 100%;
  height: 100%;
  position: fixed;
}

.word-headers {
  height: var(--single-row-header-height);
  width: 100%;
  overflow-y: scroll;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

.word-header {
  width: 100%;
  height: var(--single-row-header-height);
  display: flex;
  flex-direction: row;
  gap: var(--gap12);
  margin: 0 auto 10px;
  max-width: var(--content-max-width);
}

.word-main {
  width: 100vw;
  overflow-y: scroll;
  margin: 0 auto;
  position: fixed;
  height: calc(100vh - var(--root-header-height) - var(--single-row-header-height) - var(--root-footer-height));
}

.word-main > * {
  max-width: var(--content-max-width);
  margin: 0 auto;
}

.speaking-active {
  color: var(--el-color-success);
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
  backdrop-filter: blur(1000px);
  text-decoration: none;
}
</style>
