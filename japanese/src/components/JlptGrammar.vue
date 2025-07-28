<template>
  <div class="grammar-headers">
    <el-input class="search" size="small" placeholder="搜索关键字" v-model.lazy="keyword" clearable/>
  </div>
  <div class="grammar-main">
    <div class="main">
      <el-table class="table" :data="grammarView" stripe>
        <el-table-column type="index" width="50"/>
        <el-table-column label="语法" prop="grammar">
          <template #default="scope">
            <div v-html="scope.row.grammar"></div>
          </template>
        </el-table-column>
        <el-table-column label="含义" prop="meaning">
          <template #default="scope">
            <div v-html="scope.row.meaning"></div>
          </template>
        </el-table-column>
        <el-table-column label="示例" prop="example">
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
</template>

<script setup lang="ts">
import {computed, ref} from 'vue'
import {useJlptGrammarStore} from "../stores/jlptGrammarStore.ts"

const grammarStore = useJlptGrammarStore()
const keyword = ref("")

const grammarView = computed(() => {
  let list = grammarStore.JlptGrammars
  const key = keyword.value
  if (key) {
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(${escapedKey})`, 'g') // 添加捕获组
    list = list.filter(item => {
      return (
          item.grammar?.toString().includes(key) ||
          item.meaning?.includes(key) ||
          item.example?.includes(key) ||
          item.level?.includes(key)
      )
    }).map(item => {
      const highlighted = {...item}
      const highlight = (text: string) => text?.replace(regex, '<span class="match">$1</span>')
      if (highlighted.grammar) highlighted.grammar = highlight(highlighted.grammar)
      if (highlighted.meaning) highlighted.meaning = highlight(highlighted.meaning)
      if (highlighted.example) highlighted.example = highlight(highlighted.example)
      return highlighted
    })
  }
  return list
})
</script>

<style scoped>
.grammar-headers {
  width: 100%;
  overflow-y: scroll;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search {
  max-width: var(--content-max-width);
  margin: 0 auto 20px;
}

.main {
  height: calc(100vh - 95px);
  overflow-y: scroll;
}

.table {
  max-width: var(--content-max-width);
  margin: 0 auto 120px;
}

:deep(.match) {
  color: var(--el-color-danger);
}
</style>
