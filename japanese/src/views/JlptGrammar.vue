<template>
  <div class="grammar">
    <Row>
      <SimpleSelect
        multiple
        :data="levels"
        v-model="selectedLevels"
        placeholder="选等级"
      />
      <SimpleInput v-model.trim="keyword" />
    </Row>

    <div class="grammar-main">
      <div class="main">
        <el-table
          class="table"
          :data="afterPage"
          :show-header="false"
          empty-text="暂无数据"
          stripe
        >
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
    <SimplePagination :data="beforePage" @page-change="pageChange" />
  </div>
</template>

<script setup lang="ts">
import { computed, type ComputedRef, ref } from 'vue'
import {
  type JlptGrammar,
  useJlptGrammarStore,
} from '../stores/jlptGrammarStore.ts'
import { ElTable } from 'element-plus'
import SimpleSelect from '../components/SimpleSelect.vue'
import Row from '../components/Row.vue'
import SimpleInput from '../components/SimpleInput.vue'
import SimplePagination from '../components/SimplePagination.vue'

const grammarStore = useJlptGrammarStore()
const keyword = ref('')

const selectedLevels = ref<string[]>([])

const levels: ComputedRef<string[]> = computed(() => {
  return [...new Set(grammarStore.JlptGrammars.map((x) => x.level))].sort()
})

const beforePage = computed(() => {
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
  return list
})

// 当前页数据
const afterPage = ref<JlptGrammar[]>([])
const pageChange = (data: JlptGrammar[]) => {
  afterPage.value = data
}
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

:deep(.el-scrollbar__wrap) {
  /* 解决移动端滚动不顺畅问题 */
  overflow-y: hidden;
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
