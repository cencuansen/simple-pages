<template>
  <div class="words">
    <div class="word-headers">
      <div class="word-header">
        <div class="header-item">
          <el-select
            size="small"
            class="navigation-item"
            v-model="lessonIndex"
            placeholder="选课程"
            clearable
            fit-input-width
          >
            <el-option
              v-for="(item, index) in lessonStore.lessons"
              :key="index"
              :label="`${displayText(item.title?.content)}`"
              :value="index"
            />
          </el-select>
        </div>
        <div class="header-item">
          <el-select
            size="small"
            class="navigation-item"
            v-model="selectedClasses"
            placeholder="选词性"
            clearable
            multiple
            collapse-tags
            fit-input-width
          >
            <el-option
              v-for="item in wordClasses"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </div>
        <div class="header-item">
          <el-input
            v-model.trim="keyword"
            size="small"
            placeholder="搜单词"
            clearable
          ></el-input>
        </div>
      </div>
    </div>

    <div class="word-main" ref="container" @scroll="containerOnScroll">
      <div ref="top"></div>
      <!-- 单词 -->
      <section class="section words-section">
        <el-table :data="words" :show-header="false">
          <el-table-column label="单词">
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
            prop="desc"
            label="释义"
            v-if="baseSettingStore.wordDesc"
            show-overflow-tooltip
          />
          <el-table-column label="课程" width="60">
            <template #default="scope">
              {{ scope.row.lesson }}
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
                @click="speechStore.speakList(words)"
              >
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
                @click="speechStore.speak(scope.row)"
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

    <div class="pagination">
      <el-pagination
        v-model:current-page="pageIndex"
        :page-size="pageSize"
        :total="totalInView"
        layout="prev, pager, next"
      />
    </div>

    <a class="go-top" href="#" @click="goTop">↑</a>
  </div>
</template>

<script setup lang="ts">
import { computed, onActivated, onBeforeUnmount, ref, watch } from 'vue'
import { useSpeechStore } from '../stores/speechStore'
import { useBaseSettingStore } from '../stores/baseSettingStore'
import { useWordStore } from '../stores/wordStore'
import { useLessonStore } from '../stores/lessonStore'
import type { WordItem } from '../types'
import { displayText, speakingId, speakingWordId } from '../utils.ts'
import { ElPagination, ElTable } from 'element-plus'

const speechStore = useSpeechStore()
const wordStore = useWordStore()
const lessonStore = useLessonStore()
const baseSettingStore = useBaseSettingStore()

const lessonIndex = ref()
const pageSize = 20
const pageIndex = ref(1)
const totalInView = ref(0)
const keyword = ref('')
const selectedClasses = ref<string[]>([])

const container = ref()
const scrollPosition = ref<number>(0)
const top = ref()

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

const words = computed(() => {
  let list: WordItem[]
  if (lessonIndex.value) {
    list = wordStore.getByLesson(lessonIndex.value + 1)
  } else {
    list = wordStore.wordList
  }
  if (keyword.value) {
    list = list.filter(
      (item) =>
        item.kana.indexOf(keyword.value) > -1 ||
        item.kanji.indexOf(keyword.value) > -1 ||
        item.desc.indexOf(keyword.value) > -1 ||
        item.word.indexOf(keyword.value) > -1
    )
  }
  if (selectedClasses.value.length > 0) {
    list = list.filter((item) => selectedClasses.value.includes(item.pos))
  }
  totalInView.value = list.length
  const start = (pageIndex.value - 1) * pageSize
  const end = start + pageSize
  return list.slice(start, end)
})

const wordClasses = computed(() => {
  return [...new Set(wordStore.wordList.map((item) => item.pos))].sort((a, b) =>
    a.localeCompare(b, 'zh-CN')
  )
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
  margin: 0 auto;
  max-width: var(--content-max-width);
}

.header-item {
  flex: 1;
}

.word-main {
  width: 100vw;
  overflow-y: scroll;
  margin: 0 auto;
  height: calc(
    100vh - var(--root-header-height) - var(--single-row-header-height) -
      var(--pagination-height) - var(--root-footer-height)
  );
}

.word-main > * {
  max-width: var(--content-max-width);
  margin: 0 auto;
}

.speaking-active {
  color: var(--el-color-success);
}

.pagination {
  width: 100%;
  overflow-y: scroll;
  height: var(--pagination-height);
}

.el-pagination {
  margin: 0 auto;
  width: var(--content-max-width);
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
