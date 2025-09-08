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
        <el-table-column label="词汇" min-width="120">
          <template #default="scope">
            <div
              :class="{
                'speaking-active': activeText(scope.row),
              }"
            >
              <div :id="scope.row.textId" class="column-word">
                {{ scope.row.word }}
              </div>
              <div class="column-kana">
                {{ scope.row.kana }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="desc" label="释义" min-width="150" />
        <el-table-column label="标签" min-width="80">
          <template #default="scope">
            <div
              class="tag-item"
              v-for="item in scope.row.levels"
              :key="item"
              :title="item"
              v-html="item"
            ></div>
          </template>
        </el-table-column>
        <el-table-column
          class-name="dict-column"
          width="70"
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
        >
          <template #default="scope">
            <Reading :item="scope.row" />
          </template>
        </el-table-column>
      </el-table>
    </div>

    <SimplePagination :data="beforePage" @page-change="pageChange" />
  </div>
</template>

<script setup lang="ts">
import { computed, type ComputedRef, onMounted, ref } from 'vue'
import { useJlptWordStore, type Vocabulary } from '../../stores/jlptWord.ts'
import { useSettingStore } from '../../stores/settingStore.ts'
import { useReadingStore } from '../../stores/readingStore.ts'

import { ElTable, ElTableColumn } from 'element-plus'
import SimpleSelect from '../../components/SimpleSelect.vue'
import Row from '../../components/Row.vue'
import SimpleInput from '../../components/SimpleInput.vue'
import SimplePagination from '../../components/SimplePagination.vue'
import Dictionary from '../../components/Dictionary/Dictionary.vue'
import Reading from '../../components/Reading.vue'

const readingStore = useReadingStore()
const vocabularyStore = useJlptWordStore()
const settingStore = useSettingStore()

const activeText = readingStore.activeText

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
  let res = vocabularyStore.vocabularies
  if (keyword.value) {
    res = res.filter((item: Vocabulary) =>
      `${item.word}${item.kana}${item.desc}${item.levels}`
        .toLowerCase()
        .includes(keyword.value.toLowerCase())
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
</style>
