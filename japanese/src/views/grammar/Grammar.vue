<template>
  <div class="grammar">
    <Row>
      <LessonSelect v-model="lessonIndex" />
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
          <el-table-column label="语法" prop="content" min-width="200">
            <template #default="scope">
              <div v-html="scope.row.title"></div>
            </template>
          </el-table-column>
          <el-table-column label="说明" min-width="200">
            <template #default="scope">
              <div v-for="item in scope.row.desc" v-html="item"></div>
            </template>
          </el-table-column>
          <el-table-column label="课程" width="50">
            <template #default="scope">
              <div v-html="scope.row.lesson"></div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <SimplePagination :data="beforePage" @page-change="pageChange" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { type Grammar, useGrammarStore } from '../../stores/grammarStore.ts'
import { ElTable } from 'element-plus'
import Row from '../../components/Row.vue'
import LessonSelect from '../../components/LessonSelect.vue'
import SimpleInput from '../../components/SimpleInput.vue'
import SimplePagination from '../../components/SimplePagination.vue'

const grammarStore = useGrammarStore()
const keyword = ref('')

const lessonIndex = ref<null | number>(null)

const beforePage = computed(() => {
  let list = grammarStore.grammars
  const key = keyword.value
  if (lessonIndex.value) {
    list = list.filter((item) => item.lesson === lessonIndex.value)
  }
  if (key) {
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(${escapedKey})`, 'g') // 添加捕获组
    list = list
      .filter((item) => `${item.lesson}${item.title}${item.desc}`.includes(key))
      .map((item) => {
        const highlighted = { ...item }
        const highlight = (text: string) =>
          text?.replace(regex, '<span class="match">$1</span>')
        if (highlighted.title) highlighted.title = highlight(highlighted.title)
        if (highlighted.desc) highlighted.desc = highlighted.desc.map(highlight)
        return highlighted
      })
  }
  return list
})

// 当前页数据
const afterPage = ref<Grammar[]>([])
const pageChange = (data: Grammar[]) => {
  afterPage.value = data
}
</script>

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
