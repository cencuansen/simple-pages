<template>
  <div class="grammar">
    <div class="grammar-headers">
      <el-input
        class="search"
        v-model.lazy="keyword"
        size="small"
        placeholder="搜索关键字"
        clearable
      />
    </div>
    <div class="grammar-main">
      <div class="main">
        <el-table class="table" :data="grammarView" stripe>
          <el-table-column label="语法" prop="content">
            <template #default="scope">
              <div v-html="scope.row.content"></div>
            </template>
          </el-table-column>
          <el-table-column label="说明">
            <template #default="scope">
              <div v-html="scope.row.desc"></div>
              <br v-if="scope.row.remark" />
              <div v-html="scope.row.remark"></div>
            </template>
          </el-table-column>
          <el-table-column label="课程" width="80">
            <template #default="scope">
              <div v-html="scope.row.lesson"></div>
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
import { useGrammarStore } from '../stores/grammarStore'
import { ElPagination } from 'element-plus'

const grammarStore = useGrammarStore()
const keyword = ref('')

const pageSize = 20
const pageIndex = ref(1)
const totalInView = ref(0)

const grammarView = computed(() => {
  let list = grammarStore.grammars
  const key = keyword.value
  if (key) {
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(${escapedKey})`, 'g') // 添加捕获组
    list = list
      .filter((item) => {
        return (
          item.lesson?.toString().includes(key) ||
          item.content?.includes(key) ||
          item.remark?.includes(key) ||
          item.desc?.includes(key)
        )
      })
      .map((item) => {
        const highlighted = { ...item }
        const highlight = (text: string) =>
          text?.replace(regex, '<span class="match">$1</span>')
        if (highlighted.content)
          highlighted.content = highlight(highlighted.content)
        if (highlighted.remark)
          highlighted.remark = highlight(highlighted.remark)
        if (highlighted.desc) highlighted.desc = highlight(highlighted.desc)
        return highlighted
      })
  }
  totalInView.value = list.length
  const start = (pageIndex.value - 1) * pageSize
  const end = start + pageSize
  return list.slice(start, end)
})
</script>

<style scoped>
.grammar {
  width: 100%;
  height: 100%;
  position: fixed;
}

.grammar-headers {
  width: 100%;
  height: var(--single-row-header-height);
  overflow-y: scroll;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search {
  max-width: var(--content-max-width);
  margin: 0 auto;
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
  overflow-y: scroll;
  height: var(--pagination-height);
}

.el-pagination {
  margin: 0 auto;
  width: var(--content-max-width);
}
</style>
