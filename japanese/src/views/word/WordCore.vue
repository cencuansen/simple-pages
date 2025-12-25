<template>
  <Row v-if="functionGroup">
    <LessonSelect
      v-if="lessonSelect"
      v-model="lessonIndex"
      fit-input-width
      lite
    />
    <SimpleSelect
      v-if="levelSelect"
      v-model="selectedLevels"
      :data="levels"
      multiple
      placeholder="选等级"
    />
    <SimpleSelect
      v-if="classSelect"
      v-model="selectedClasses"
      :data="wordClasses"
      multiple
      placeholder="选词性"
    />
    <SimpleInput v-if="keywordFilter" v-model="keyword" />
  </Row>
  <div ref="container" class="main-table" @scrollend="scrollend">
    <el-table :data="afterPage" :show-header="showHeader" stripe>
      <el-table-column min-width="100">
        <template #header>
          <div class="column-header">
            <SimpleInput
              v-model="wordFilter"
              placeholder="单词"
              class="header-filter"
              @input="applyFilters"
              cache-id="word-keyword"
            />
          </div>
        </template>
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
              {{ toHiragana(scope.row.kana) }}
            </div>
            <div v-if="settingStore.kana" class="column-kana">
              {{ toRomaji(scope.row.kana) }}
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        v-if="wordClasses.length"
        label="词性"
        prop="pos"
        show-overflow-tooltip
        width="100"
      >
        <template #header>
          <SimpleSelect
            v-model="selectedClasses"
            :data="wordClasses"
            multiple
            placeholder="词性"
          />
        </template>
      </el-table-column>
      <el-table-column v-if="settingStore.wordDesc" min-width="130">
        <template #header>
          <div class="column-header">
            <SimpleInput
              v-model="descFilter"
              placeholder="释义"
              class="header-filter"
              @input="applyFilters"
              cache-id="word-desc"
            />
          </div>
        </template>
        <template #default="scope">
          {{ scope.row.desc }}
        </template>
      </el-table-column>
      <el-table-column
        v-if="settingStore.devMode"
        label="id"
        width="110"
        show-overflow-tooltip
      >
        <template #default="scope">
          <el-text @click="copy(scope.row.textId)">
            {{ scope.row.textId }}
          </el-text>
        </template>
      </el-table-column>
      <el-table-column v-if="showLesson" label="课程" width="100">
        <template #header>
          <LessonSelect
            v-model="lessonIndex"
            fit-input-width
            lite
            placeholder="课程"
          />
        </template>
        <template #default="scope">
          <a href="#" @click="lessonClick(scope.row.lesson)">
            {{ scope.row.lesson }}
          </a>
        </template>
      </el-table-column>
      <el-table-column
        v-if="props.levelSelect"
        label="等级"
        show-overflow-tooltip
        width="80"
      >
        <template #default="scope">
          <div v-for="level in scope.row.levels">
            {{ level }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="联想" width="60">
        <template #default="scope">
          <el-button
            type="primary"
            link
            @click="showRelation(scope.row as WordItem)"
          >
            联想
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        v-if="settingStore.wordDict"
        class-name="dict-column"
        label="词典"
        width="70"
      >
        <template #header>
          <DictionarySelector
            v-if="afterPage.length"
            @change="dictionaryChange"
          />
        </template>
        <template #default="scope">
          <DictionaryCore :dict="nowDict" :word="scope.row.word" />
        </template>
      </el-table-column>
      <el-table-column
        v-if="settingStore.ttsSpeak || voiceVoxStore.usable"
        class-name="reading-column"
        fixed="right"
        label=""
        width="50"
      >
        <template #header>
          <Reading :words="afterPage as WordItem[]" />
        </template>
        <template #default="scope">
          <Reading :word="scope.row as WordItem" />
        </template>
      </el-table-column>
      <template #append v-if="wordFilter">
        <div class="dict-row">
          <DictionaryCore
            v-for="dict in dictionaries"
            :dict="dict"
            :word="wordFilter"
          />
        </div>
      </template>
    </el-table>
  </div>

  <SimplePagination
    v-if="pagination"
    :data="beforePage"
    :page-size="pageSize"
    @page-change="pageChange"
  />

  <el-dialog
    :modal="true"
    v-model="drawerVisible"
    title="词汇联想"
    fullscreen
    center
  >
    <WordGraph
      v-if="graphTargetWord"
      :current-word="graphTargetWord"
      :all-words="props.data"
      @node-click="handleNodeClick"
    />
  </el-dialog>
</template>

<script lang="ts" setup>
import {
  computed,
  type ComputedRef,
  onActivated,
  onBeforeUnmount,
  ref,
  withDefaults,
} from 'vue'
import { useSpeechStore } from '@/stores/speechStore.ts'
import { useVoiceVoxStore } from '@/stores/voiceVox/voiceVoxStore.ts'
import { useSettingStore } from '@/stores/settingStore.ts'
import { useReadingStore } from '@/stores/readingStore.ts'
import { useDictionaryStore } from '@/stores/dictionaryStore.ts'
import type { ActiveWord, WordItem } from '@/types/word.ts'
import { ElNotification, ElTable } from 'element-plus'
import Row from '@/components/Row.vue'
import LessonSelect from '@/components/LessonSelect.vue'
import SimpleSelect from '@/components/SimpleSelect.vue'
import SimpleInput from '@/components/SimpleInput.vue'
import SimplePagination from '@/components/SimplePagination.vue'
import Reading from '@/components/Reading.vue'
import DictionarySelector from '@/components/Dictionary/DictionarySelector.vue'
import DictionaryCore from '@/components/Dictionary/DictionaryCore.vue'
import WordGraph from '@/components/Graph/WordGraph.vue'
import { isNumber } from '@/utils/common.ts'
import { toRomaji, toHiragana } from '@/utils/tool.ts'

import type { Dictionary as DictionaryType } from '../../types/dictionary.ts'
import { storeToRefs } from 'pinia'

interface WordProps {
  data: WordItem[]
  pageSize?: number
  activeWord?: ActiveWord | null
  showLesson?: boolean
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
  showLesson: false,
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

// 新增：单词和释义的过滤条件
const wordFilter = ref<string>('')
const descFilter = ref<string>('')

const readingStore = useReadingStore()
const speechStore = useSpeechStore()
const settingStore = useSettingStore()
const voiceVoxStore = useVoiceVoxStore()
const dictionaryStore = useDictionaryStore()

const activeText = readingStore.activeText

const initDict = dictionaryStore.getOne()
const nowDict = ref<DictionaryType>(initDict)
const { dictionaries } = storeToRefs(dictionaryStore)
const dictionaryChange = (newDict: DictionaryType) => {
  nowDict.value = newDict
}

const selectedClasses = ref<string[]>([])
const selectedLevels = ref<string[]>([])

const levels: ComputedRef<string[]> = computed(() => {
  return [
    ...new Set(props.data.flatMap((item: WordItem) => item.levels)),
  ].sort()
})

const beforePage = computed(() => {
  let list: WordItem[] = props.data
  if (props.activeWord) {
    const { textId, lesson } = props.activeWord
    list = list.filter(
      (item) => item.textId === textId && item.lesson === lesson
    )
    // 短路。只根据点击的单词过滤
    return list
  }
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
  // 新增：应用单词和释义过滤
  if (wordFilter.value) {
    list = list.filter(
      (item) =>
        item.word.includes(wordFilter.value) ||
        (item.kana && item.kana.includes(wordFilter.value))
    )
  }
  if (descFilter.value) {
    list = list.filter(
      (item) => item.desc && item.desc.includes(descFilter.value)
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
  return [...new Set(props.data.map((item) => item.pos).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b, 'zh-CN')
  )
})

const lessonClick = (val: number) => {
  if (Boolean(lessonIndex.value)) {
    lessonIndex.value = void 0
  } else {
    lessonIndex.value = val
  }
}

// 新增：应用过滤
const applyFilters = () => {
  // 过滤逻辑已集成在beforePage计算属性中
  // 这里只需要触发重新计算
}

const copy = async (text: string) => {
  await navigator.clipboard.writeText(text)
  ElNotification.success(`Copied!`)
}

// 控制抽屉显示
const drawerVisible = ref(false)
const graphTargetWord = ref<WordItem | null>(null)

// 点击触发展示关系图
const showRelation = (row: WordItem) => {
  graphTargetWord.value = row
  drawerVisible.value = true
}

// 在图表中点击了其他单词节点，跳转或查看该单词
const handleNodeClick = (word: WordItem) => {
  // 可以是关闭抽屉并定位到该单词，或者直接在图表中切换中心词
  graphTargetWord.value = word
}

onBeforeUnmount(() => {
  speechStore.stop()
})

const container = ref()
const scrollPosition = ref<number>(0)
const scrollend = async () => {
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
.el-table {
  min-height: 250px;
  font-size: 1.5rem;
}

:deep(.reading-column .cell) {
  display: flex;
  align-items: center;
  justify-content: center;
}

.column-kana {
  font-size: 1.2rem;
}

:deep(.el-table .el-scrollbar__wrap) {
  /* 解决移动端滚动不顺畅问题 */
  overflow-y: hidden;
}

/* 新增：表头过滤样式 */
.column-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dict-row {
  height: 50px;
  margin: 10px 0;
  display: flex;
  gap: var(--gap-12);
  align-items: center;
  justify-content: safe center;
}

/* 详情卡片样式 */
.word-detail-card {
  margin-top: 20px;
  border-top: 2px solid #409eff;
}
.card-header {
  display: flex;
  justify-content: space-between;
  font-size: 1.2rem;
}
.kana-text {
  color: #666;
  font-size: 0.9rem;
}
.desc-text {
  margin-top: 10px;
  font-size: 1rem;
  line-height: 1.5;
}
</style>
