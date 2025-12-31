<template>
  <div class="grammar">
    <GrammarCore
      :data="grammars"
      :function-group="functionGroup"
      :pagination="pagination"
      :lesson-select="lessonSelect"
      :keyword-filter="keywordFilter"
      :scroll-top="scrollTop"
      auto-expand
      show-lesson
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useGrammarStore } from '@/stores/grammar/grammarStore.ts'
import GrammarCore from '../../components/Grammar/GrammarCore.vue'
import { storeToRefs } from 'pinia'
import { tableHeightCalc } from '../../utils/word'

const grammarStore = useGrammarStore()
const { grammars } = storeToRefs(grammarStore)

const functionGroup = ref(true)
const lessonSelect = ref(true)
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

.grammar-title-row {
  display: flex;
}

.grammar-title {
  flex: 9;
}

.grammar-lesson {
  flex: 1;
  text-align: right;
}
</style>
