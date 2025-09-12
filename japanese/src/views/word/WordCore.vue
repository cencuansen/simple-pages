<template>
  <Row v-if="functionGroup">
    <LessonSelect v-model="lessonIndex" lite v-if="lessonSelect" />
    <SimpleSelect
      v-if="levelSelect"
      multiple
      :data="levels"
      v-model="selectedLevels"
      placeholder="选等级"
    />
    <SimpleSelect
      v-if="classSelect"
      multiple
      :data="wordClasses"
      v-model="selectedClasses"
      placeholder="选词性"
    />
    <SimpleInput v-model="keyword" v-if="keywordFilter" />
  </Row>
  <div class="main-table" ref="container" @scroll="onScroll">
    <el-table
      :data="afterPage"
      :show-header="showHeader"
      empty-text="暂无数据"
      stripe
    >
      <el-table-column label="单词" min-width="100">
        <template #default="scope">
          <div
            :class="{
              active: activeText((scope.row as WordItem).textId),
            }"
          >
            <div
              v-if="settingStore.word"
              :id="(scope.row as WordItem).textId"
              class="column-word"
            >
              {{ scope.row.word }}
            </div>
            <div v-if="settingStore.kana" class="column-kana">
              {{ scope.row.kana }}
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="词性"
        width="60"
        prop="pos"
        show-overflow-tooltip
      />
      <el-table-column
        label="释义"
        min-width="150"
        prop="desc"
        v-if="settingStore.wordDesc"
        show-overflow-tooltip
      />
      <el-table-column label="课程" width="60" v-if="!props.lessonIndex">
        <template #default="scope">
          <a href="#" @click="lessonClick(scope.row.lesson)">
            {{ scope.row.lesson }}
          </a>
        </template>
      </el-table-column>
      <el-table-column
        label="等级"
        width="80"
        show-overflow-tooltip
        v-if="props.levelSelect"
      >
        <template #default="scope">
          <div v-for="level in scope.row.levels">
            {{ level }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        class-name="dict-column"
        width="60"
        label="词典"
        v-if="settingStore.wordDict"
      >
        <template #default="scope">
          <Dictionary :word="scope.row.word" />
        </template>
      </el-table-column>
      <el-table-column
        label=""
        width="50"
        v-if="settingStore.ttsSpeak"
        fixed="right"
        class-name="reading-column"
      >
        <template #header>
          <Reading :words="afterPage as WordItem[]" />
        </template>
        <template #default="scope">
          <Reading :word="scope.row as WordItem" />
        </template>
      </el-table-column>
    </el-table>
  </div>
  <SimplePagination
    v-if="pagination"
    :data="beforePage"
    @page-change="pageChange"
  />
</template>

<script setup lang="ts">
import {
  computed,
  type ComputedRef,
  onActivated,
  onBeforeUnmount,
  ref,
  withDefaults,
} from 'vue'
import { useSpeechStore } from '../../stores/speechStore.ts'
import { useSettingStore } from '../../stores/settingStore.ts'
import { useWordStore } from '../../stores/wordStore.ts'
import { useReadingStore } from '../../stores/readingStore.ts'

import type { WordItem } from '../../types'
import { ElTable } from 'element-plus'

import Row from '../../components/Row.vue'
import LessonSelect from '../../components/LessonSelect.vue'
import SimpleSelect from '../../components/SimpleSelect.vue'
import SimpleInput from '../../components/SimpleInput.vue'
import SimplePagination from '../../components/SimplePagination.vue'
import Dictionary from '../../components/Dictionary/Dictionary.vue'
import Reading from '../../components/Reading.vue'
import { isNumber } from '../../utils'

interface WordProps {
  data: WordItem[]
  keyword?: string
  scrollTop?: boolean
  functionGroup?: boolean
  showHeader?: boolean
  lessonIndex?: number | null | undefined
  pagination?: boolean
  lessonSelect?: boolean
  levelSelect?: boolean
  classSelect?: boolean
  keywordFilter?: boolean
}

const props = withDefaults(defineProps<WordProps>(), {
  keyword: '',
  scrollTop: false,
  functionGroup: false,
  showHeader: false,
  lessonIndex: null,
  pagination: false,
  lessonSelect: false,
  levelSelect: false,
  classSelect: false,
  keywordFilter: false,
})

const lessonIndex = ref<number | undefined>()
const keyword = ref<string>('')

const readingStore = useReadingStore()
const speechStore = useSpeechStore()
const wordStore = useWordStore()
const settingStore = useSettingStore()

const activeText = readingStore.activeText

const selectedClasses = ref<string[]>([])
const selectedLevels = ref<string[]>([])

const levels: ComputedRef<string[]> = computed(() => {
  return [
    ...new Set(props.data.flatMap((item: WordItem) => item.levels)),
  ].sort()
})

const beforePage = computed(() => {
  let list: WordItem[] = props.data
  if (props.keyword) {
    list = list.filter((item) =>
      `${item.word}_${item.kana}_${item.desc}`.includes(props.keyword)
    )
  }
  if (isNumber(props.lessonIndex)) {
    list = list.filter((item) => item.lesson === props.lessonIndex)
  }

  if (keyword.value) {
    list = list.filter((item) =>
      `${item.word}_${item.kana}_${item.desc}`.includes(keyword.value)
    )
  }
  if (isNumber(lessonIndex.value)) {
    list = list.filter((item) => item.lesson === lessonIndex.value)
  }
  if (selectedClasses.value.length) {
    list = list.filter((item) => selectedClasses.value.includes(item.pos))
  }
  if (selectedLevels.value.length) {
    list = list.filter((item) =>
      item.levels.some((level) =>
        selectedLevels.value.some((sl) => level.includes(sl))
      )
    )
  }
  return list
})

// 当前页数据
const _afterPage = ref<WordItem[]>([])
const pageChange = (data: WordItem[]) => {
  _afterPage.value = data
  container.value.scrollTop = 0
}

const afterPage = computed(() => {
  if (props.pagination) {
    return _afterPage.value
  }
  return beforePage.value
})

const wordClasses = computed(() => {
  return [...new Set(wordStore.wordList.map((item) => item.pos))].sort((a, b) =>
    a.localeCompare(b, 'zh-CN')
  )
})

const lessonClick = (val: number) => {
  if (isNumber(lessonIndex.value)) {
    lessonIndex.value = void 0
  } else {
    lessonIndex.value = val
  }
}

onBeforeUnmount(() => {
  speechStore.stop()
})

const container = ref()
const scrollPosition = ref<number>(0)
const onScroll = async () => {
  if (props.scrollTop) {
    scrollPosition.value = container.value.scrollTop
  }
}

onActivated(async () => {
  if (props.scrollTop) {
    setTimeout(() => {
      if (container && container.value) {
        container.value.scrollTop = scrollPosition.value
      }
    })
  }
})
</script>

<style scoped>
:deep(.reading-column .cell) {
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.el-table .el-scrollbar__wrap) {
  /* 解决移动端滚动不顺畅问题 */
  overflow-y: hidden;
}
</style>
