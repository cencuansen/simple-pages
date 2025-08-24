<template>
  <div class="grammar">
    <div class="grammar-headers">
      <div class="grammar-header">
        <div class="header-item">
          <el-select
            size="small"
            v-model="selectedLevels"
            placeholder="选等级"
            clearable
            multiple
            collapse-tags
            fit-input-width
          >
            <el-option
              v-for="item in levels"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </div>
        <div class="header-item">
          <el-input
            class="search"
            v-model.lazy="keyword"
            size="small"
            placeholder="搜索关键字"
            clearable
          />
        </div>
      </div>
    </div>
    <div class="grammar-main">
      <div class="main">
        <el-table class="table" :data="grammarView" stripe :show-header="false">
          <el-table-column label="语法" prop="grammar" min-width="200">
            <template #default="scope">
              <div v-html="scope.row.grammar"></div>
            </template>
          </el-table-column>
          <el-table-column label="含义" prop="meaning" min-width="200">
            <template #default="scope">
              <div v-html="scope.row.meaning"></div>
            </template>
          </el-table-column>
          <el-table-column label="示例" prop="example" min-width="200">
            <template #default="scope">
              <div v-html="scope.row.example"></div>
            </template>
          </el-table-column>
          <el-table-column label="级别" prop="level" width="60">
            <template #default="scope">
              <div v-html="scope.row.level"></div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <div class="pagination">
      <el-pagination
        v-model:current-page="pageIndex"
        :page-size="pageSize"
        :total="totalInView"
        layout="prev, pager, next"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useJlptGrammarStore } from '../stores/jlptGrammarStore.ts'
import { ElPagination, ElTable } from 'element-plus'

const grammarStore = useJlptGrammarStore()
const keyword = ref('')

const pageSize = 20
const pageIndex = ref(1)
const totalInView = ref(0)

const selectedLevels = ref<string[]>([])

const levels = computed(() => {
  return [...new Set(grammarStore.JlptGrammars.map((x) => x.level))].sort()
})

const grammarView = computed(() => {
  let list = grammarStore.JlptGrammars
  const key = keyword.value
  if (key) {
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(${escapedKey})`, 'g') // 添加捕获组
    list = list
      .filter((item) => {
        return (
          item.grammar?.toString().includes(key) ||
          item.meaning?.includes(key) ||
          item.example?.includes(key) ||
          item.level?.includes(key)
        )
      })
      .map((item) => {
        const highlighted = { ...item }
        const highlight = (text: string) =>
          text?.replace(regex, '<span class="match">$1</span>')
        if (highlighted.grammar)
          highlighted.grammar = highlight(highlighted.grammar)
        if (highlighted.meaning)
          highlighted.meaning = highlight(highlighted.meaning)
        if (highlighted.example)
          highlighted.example = highlight(highlighted.example)
        return highlighted
      })
  }
  if (selectedLevels.value.length > 0) {
    list = list.filter((item) => selectedLevels.value.includes(item.level))
  }
  totalInView.value = list.length
  const start = (pageIndex.value - 1) * pageSize
  const end = start + pageSize
  return list.slice(start, end)
})
</script>

<style>
:root {
  --grammar-headers-height: 35px;
}
</style>

<style scoped>
.grammar {
  width: 100%;
  height: 100%;
  position: fixed;
}

.grammar-headers {
  overflow-y: scroll;
}

.grammar-header {
  height: var(--single-row-header-height);
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: var(--gap12);
  margin: 0 auto;
  max-width: var(--content-max-width);
}

.header-item {
  flex: 1;
}

.main {
  overflow-y: scroll;
  height: calc(
    100vh - var(--root-header-height) - var(--single-row-header-height) -
      var(--pagination-height) - var(--root-footer-height)
  );
}

.table {
  max-width: var(--content-max-width);
  margin: 0 auto;
}

.pagination {
  width: 100%;
  overflow-x: hidden;
  overflow-y: scroll;
  height: var(--pagination-height);
}

.el-pagination {
  margin: 0 auto;
  width: var(--content-max-width);
}
</style>
