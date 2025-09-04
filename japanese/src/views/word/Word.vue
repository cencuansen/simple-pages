<template>
  <div class="words">
    <Row>
      <LessonSelect v-model="lessonIndex" />
      <SimpleSelect
        multiple
        :data="wordClasses"
        v-model="selectedClasses"
        placeholder="选词性"
      />
      <SimpleInput v-model.trim="keyword" />
    </Row>

    <div class="word-main" ref="container" @scroll="containerOnScroll">
      <div ref="top"></div>
      <!-- 单词 -->
      <section class="section words-section">
        <el-table
          :data="afterPage"
          :show-header="false"
          empty-text="暂无数据"
          stripe
        >
          <el-table-column label="单词" min-width="120">
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
          <el-table-column label="课程" width="60">
            <template #default="scope">
              {{ scope.row.lesson }}
            </template>
          </el-table-column>
          <el-table-column
            class-name="dict-column"
            width="60"
            label="字典"
            v-if="baseSettingStore.wordDict"
          >
            <template #default="scope">
              <Dictionary :word="scope.row.word" :dict="'JapanDict'"/>
            </template>
          </el-table-column>
          <el-table-column
            label=""
            width="50"
            v-if="baseSettingStore.ttsSpeak"
            fixed="right"
          >
            <template #header>
              <el-button
                type="primary"
                size="small"
                circle
                v-if="baseSettingStore.ttsSpeak && lessonIndex"
                :disabled="speechStore.isSpeaking"
                @click="speechStore.speakList(beforePage)"
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

    <SimplePagination :data="beforePage" @page-change="pageChange" />

    <a class="go-top" href="#" @click="goTop">↑</a>
  </div>
</template>

<script setup lang="ts">
import { computed, onActivated, onBeforeUnmount, ref, watch } from 'vue'
import { useSpeechStore } from '../../stores/speechStore.ts'
import { useBaseSettingStore } from '../../stores/baseSettingStore.ts'
import { useWordStore } from '../../stores/wordStore.ts'
import type { WordItem } from '../../types'
import { speakingId, speakingWordId } from '../../utils'
import { ElTable } from 'element-plus'

import Row from '../../components/Row.vue'
import LessonSelect from '../../components/LessonSelect.vue'
import SimpleSelect from '../../components/SimpleSelect.vue'
import SimpleInput from '../../components/SimpleInput.vue'
import SimplePagination from '../../components/SimplePagination.vue'
import Dictionary from '../../components/Dictionary/Dictionary.vue'

const speechStore = useSpeechStore()
const wordStore = useWordStore()
const baseSettingStore = useBaseSettingStore()

const lessonIndex = ref()
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

const beforePage = computed(() => {
  let list: WordItem[]
  if (lessonIndex.value) {
    list = wordStore.getByLesson(lessonIndex.value)
  } else {
    list = wordStore.wordList
  }
  if (keyword.value) {
    list = list.filter(
      (item) =>
        item.kana.indexOf(keyword.value) > -1 ||
        item.desc.indexOf(keyword.value) > -1 ||
        item.word.indexOf(keyword.value) > -1
    )
  }
  if (selectedClasses.value.length > 0) {
    list = list.filter((item) => selectedClasses.value.includes(item.pos))
  }
  return list
})

// 当前页数据
const afterPage = ref<WordItem[]>([])
const pageChange = (data: WordItem[]) => {
  afterPage.value = data
}

const wordClasses = computed(() => {
  return [...new Set(wordStore.wordList.map((item) => item.pos))].sort((a, b) =>
    a.localeCompare(b, 'zh-CN')
  )
})

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

:deep(.el-scrollbar__wrap) {
  /* 解决移动端滚动不顺畅问题 */
  overflow-y: hidden;
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
