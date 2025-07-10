<template>
  <div class="grammar-container">
    <div class="head">
      <el-input class="search" size="small" placeholder="搜索关键字" v-model.lazy="keyword" clearable/>
    </div>
    <div class="main">
      <el-table class="table" :data="grammarView" stripe>
        <el-table-column label="课程" width="80">
          <template #default="scope">
            <div v-html="scope.row.lesson"></div>
          </template>
        </el-table-column>
        <el-table-column label="语法" prop="content">
          <template #default="scope">
            <div v-html="scope.row.content"></div>
          </template>
        </el-table-column>
        <el-table-column label="说明">
          <template #default="scope">
            <div v-html="scope.row.desc"></div>
            <br v-if="scope.row.remark"/>
            <div v-html="scope.row.remark"></div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue'
import {useGrammarStore} from "../stores/grammarStore"

const grammarStore = useGrammarStore()
const keyword = ref("")

const grammarView = computed(() => {
  let list = grammarStore.grammars
  const key = keyword.value
  if (key) {
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(${escapedKey})`, 'g') // 添加捕获组
    list = list.filter(item => {
      return (
          item.lesson?.toString().includes(key) ||
          item.content?.includes(key) ||
          item.remark?.includes(key) ||
          item.desc?.includes(key)
      )
    }).map(item => {
      const highlighted = {...item}
      const highlight = (text: string) => text?.replace(regex, '<span class="match">$1</span>')
      if (highlighted.content) highlighted.content = highlight(highlighted.content)
      if (highlighted.remark) highlighted.remark = highlight(highlighted.remark)
      if (highlighted.desc) highlighted.desc = highlight(highlighted.desc)
      return highlighted
    })
  }
  return list
})
</script>

<style scoped>
.head {
  width: 100%;
  overflow-y: scroll;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search {
  max-width: var(--content-max-width);
  margin: 10px auto 20px;
}

.main {
  height: calc(100vh - 95px);
  overflow: auto;
}

.table {
  max-width: var(--content-max-width);
  margin: 0 auto 120px;
}

:deep(.match) {
  color: var(--el-color-danger);
}
</style>
