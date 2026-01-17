<template>
  <div class="words">
    <WordCore
      :data="vocabularies"
      :function-group="functionGroup"
      :pagination="pagination"
      :scroll-top="scrollTop"
      :levelSelect="levelSelect"
      :keyword-filter="keywordFilter"
      :show-relation="showRelation"
      :page-size="20"
      show-header
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useJlptWordStore } from '@/stores/jlptWordStore'

import WordCore from '@/components/Word/WordCore.vue'
import { storeToRefs } from 'pinia'
import { tableHeightCalc } from '@/utils/word'

const vocabularyStore = useJlptWordStore()

const { vocabularies } = storeToRefs(vocabularyStore)

// 初始化加载数据
onMounted(() => {
  vocabularyStore.loadVocabularies()
})

const functionGroup = ref(false)
const pagination = ref(true)
const scrollTop = ref(true)
const levelSelect = ref(true)
const keywordFilter = ref(true)
const showRelation = ref(true)

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
</style>
