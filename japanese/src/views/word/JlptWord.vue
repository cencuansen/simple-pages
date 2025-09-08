<template>
  <div class="words">
    <Word2
      :data="vocabularies"
      :function-group="functionGroup"
      :pagination="pagination"
      :scroll-top="scrollTop"
      :levelSelect="levelSelect"
      :keyword-filter="keywordFilter"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useJlptWordStore } from '../../stores/jlptWord.ts'

import Word2 from './Word2.vue'
import { storeToRefs } from 'pinia'
import { tableHeightCalc } from './index.ts'

const vocabularyStore = useJlptWordStore()

const { vocabularies } = storeToRefs(vocabularyStore)

// 初始化加载数据
onMounted(() => {
  vocabularyStore.loadVocabularies()
})

const functionGroup = ref(true)
const pagination = ref(true)
const scrollTop = ref(true)
const levelSelect = ref(true)
const keywordFilter = ref(true)

const tableHeight = computed(() => {
  return tableHeightCalc(functionGroup.value, pagination.value)
})
</script>

<style scoped>
.words {
  width: 100%;
  height: 100%;
  position: fixed;
}

:deep(.main-table) {
  height: v-bind(tableHeight);
  width: 100vw;
  overflow-y: scroll;
}

:deep(.el-table) {
  margin: 0 auto;
  max-width: var(--content-max-width);
}

/*.word-main {
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
  !* 解决移动端滚动不顺畅问题 *!
  overflow-y: hidden;
}

.tag-item {
  width: 100%;
  overflow: hidden;
  text-wrap: nowrap;
  text-overflow: ellipsis;
}*/
</style>
