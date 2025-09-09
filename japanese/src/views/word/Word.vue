<template>
  <div class="words">
    <WordCore
      :data="wordList"
      :function-group="functionGroup"
      :pagination="pagination"
      :scroll-top="scrollTop"
      :lesson-select="lessonSelect"
      :class-select="classSelect"
      :keyword-filter="keywordFilter"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useSpeechStore } from '../../stores/speechStore.ts'
import { useWordStore } from '../../stores/wordStore.ts'
import { useReadingStore } from '../../stores/readingStore.ts'
import { storeToRefs } from 'pinia'

import WordCore from './WordCore.vue'
import { tableHeightCalc } from './index.ts'

const readingStore = useReadingStore()
const speechStore = useSpeechStore()
const wordStore = useWordStore()

const { nowTextId } = storeToRefs(readingStore)
const { wordList } = storeToRefs(wordStore)

watch(
  () => speechStore.lastFireTime,
  (_) => {
    document.getElementById(nowTextId.value)?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
    })
  }
)

onBeforeUnmount(() => {
  speechStore.stop()
})

const functionGroup = ref(true)
const pagination = ref(true)
const scrollTop = ref(true)
const lessonSelect = ref(true)
const classSelect = ref(true)
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
</style>
