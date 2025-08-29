<template>
  <div class="words">
    <Row>
      <SimpleSelect
        multiple
        :data="levels"
        v-model="selectedLevels"
        :filterable="true"
        :allow-create="true"
        placeholder="选等级"
      />
      <SimpleInput v-model.trim="keyword" />
    </Row>

    <div class="word-main">
      <el-table
        :data="afterPage"
        v-loading="vocabularyStore.loading"
        :show-header="false"
        empty-text="暂无数据"
        stripe
      >
        <el-table-column label="词汇" min-width="150">
          <template #default="scope">
            <div :id="`word-${scope.row.expression}`" class="column-word">
              {{ scope.row.expression }}
            </div>
            <div :id="`word-${scope.row.reading}`" class="column-kana">
              {{ scope.row.reading }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="meaning" label="释义" min-width="150" />
        <el-table-column label="标签" min-width="150">
          <template #default="scope">
            <div
              class="tag-item"
              v-for="item in scope.row.levels"
              :key="item"
              :title="item"
              v-html="item"
              :class="{ match: selectedLevels.some(sl => item.includes(sl)) }"
            ></div>
          </template>
        </el-table-column>
        <el-table-column
          label=""
          width="50"
          v-if="baseSettingStore.ttsSpeak"
          fixed="right"
        >
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              circle
              :disabled="speechStore.isSpeaking"
              @click="speechStore.speak(scope.row.reading)"
            >
              <el-icon>
                <i class="icon-on-MPIS-TTS"></i>
              </el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <SimplePagination :data="beforePage" @page-change="pageChange" />
  </div>
</template>

<script setup lang="ts">
import { computed, type ComputedRef, onMounted, ref } from 'vue'
import { useSpeechStore } from '../stores/speechStore'
import {
  useVocabularyStore,
  type Vocabulary,
} from '../stores/vocabularyStore.ts'
import { useBaseSettingStore } from '../stores/baseSettingStore'
import { ElTable, ElTableColumn } from 'element-plus'
import SimpleSelect from './shares/SimpleSelect.vue'
import Row from './shares/Row.vue'
import SimpleInput from './shares/SimpleInput.vue'
import SimplePagination from './shares/SimplePagination.vue'

const vocabularyStore = useVocabularyStore()
const speechStore = useSpeechStore()
const baseSettingStore = useBaseSettingStore()

// 初始化加载数据
onMounted(() => {
  vocabularyStore.loadVocabularies()
})

const keyword = ref<string>('')
const selectedLevels = ref<string[]>(['jlpt'])

const levels: ComputedRef<string[]> = computed(() => {
  return [
    ...new Set(
      vocabularyStore.vocabularies.flatMap((item: Vocabulary) => item.levels)
    ),
  ].sort()
})

const beforePage = computed(() => {
  keyword.value = keyword.value.toLowerCase()
  let res = vocabularyStore.vocabularies
  if (keyword.value) {
    res = res.filter(
      (item: Vocabulary) =>
        item.expression.toLowerCase().includes(keyword.value) ||
        item.reading.toLowerCase().includes(keyword.value) ||
        item.meaning.toLowerCase().includes(keyword.value) ||
        item.levels.includes(keyword.value)
    )
  }
  if (selectedLevels.value.length > 0) {
    const keys = selectedLevels.value.map((x) => x.toLowerCase())
    res = res.filter((item: Vocabulary) =>
      item.levels.some(
        (x: string) => keys.includes(x) || keys.some((k) => x.includes(k))
      )
    )
  }

  return res
})

// 当前页数据
const afterPage = ref<Vocabulary[]>([])
const pageChange = (data: Vocabulary[]) => {
  afterPage.value = data
}
</script>

<style scoped>
.words {
  width: 100%;
  height: 100%;
  position: fixed;
}

.word-main {
  margin: 0 auto;
  padding: 0;
  overflow-y: scroll;
  width: 100%;
  height: calc(
    100vh - var(--root-header-height) - var(--single-row-header-height) -
      var(--pagination-height) - var(--root-footer-height)
  );
}

.el-table {
  margin: 0 auto;
  max-width: var(--content-max-width);
}

:deep(.el-scrollbar__wrap) {
  /* 解决移动端滚动不顺畅问题 */
  overflow-y: hidden;
}

.tag-item {
  width: 100%;
  overflow: hidden;
  text-wrap: nowrap;
  text-overflow: ellipsis;
}

.pagination {
  width: 100%;
  height: var(--pagination-height);
  overflow-y: scroll;
  overflow-x: hidden;
}

.el-pagination {
  margin: 0 auto;
  max-width: var(--content-max-width);
}
</style>
