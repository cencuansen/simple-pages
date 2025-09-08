<template>
  <div class="words">
    <Word2
      :data="wordList"
      :function-group="functionGroup"
      :pagination="pagination"
      :scroll-top="scrollTop"
      :lesson-select="lessonSelect"
      :class-select="classSelect"
      :keyword-filter="keywordFilter"
    />
    <a class="go-top" href="#" @click="goTop">↑</a>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useSpeechStore } from '../../stores/speechStore.ts'
import { useWordStore } from '../../stores/wordStore.ts'
import { useReadingStore } from '../../stores/readingStore.ts'
import { storeToRefs } from 'pinia'

import Word2 from './Word2.vue'
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

const top = ref()

const goTop = () => {
  top.value.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
    inline: 'nearest',
  })
}

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

.go-top {
  position: absolute;
  bottom: 100px;
  right: 50px;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 50%;
  line-height: 25px;
  text-align: center;
  user-select: none;
  z-index: 999;
  color-scheme: inherit;
  font-weight: bolder;
  font-size: 1.5rem;
  color: var(--el-color-primary);
  background-color: inherit;
  backdrop-filter: blur(1000px);
  text-decoration: none;
}
</style>
