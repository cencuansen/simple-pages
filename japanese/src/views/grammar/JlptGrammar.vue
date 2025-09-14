<template>
  <div class="grammar">
    <GrammarCore
      :data="jlptGrammars"
      :function-group="functionGroup"
      :pagination="pagination"
      :level-select="levelSelect"
      :keyword-filter="keywordFilter"
      :scroll-top="scrollTop"
      auto-expand
      show-lesson
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useJlptGrammarStore } from '../../stores/grammar/jlptGrammarStore.ts'
import { storeToRefs } from 'pinia'
import { tableHeightCalc } from '../word'
import GrammarCore from './GrammarCore.vue'

const grammarStore = useJlptGrammarStore()
const { jlptGrammars } = storeToRefs(grammarStore)

const functionGroup = ref(true)
const levelSelect = ref(true)
const keywordFilter = ref(true)
const pagination = ref(true)
const scrollTop = ref(true)

const tableHeight = computed(() => {
  return tableHeightCalc(functionGroup.value, pagination.value)
})
</script>

<style scoped>
.grammar {
  width: 100%;
  height: 100%;
  position: fixed;
}

:deep(.grammar-main) {
  width: 100vw;
  overflow-y: scroll;
  height: v-bind(tableHeight);
}

:deep(.main) {
  max-width: var(--content-max-width);
  margin: 0 auto;
}

:deep(.el-scrollbar__wrap) {
  /* 解决移动端滚动不顺畅问题 */
  overflow-y: hidden;
}
</style>
