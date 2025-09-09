<template>
  <el-form-item
    :label="displayText(row.speaker)"
    v-for="row in rows"
    :key="row.textId"
  >
    <div class="text-row">
      <Reading :item="row" />
      <el-text
        :id="row.textId"
        class="text-content"
        :class="{
          'speaking-active': activeText(row),
        }"
        v-html="textView(row.content)"
        @click="aClick"
      ></el-text>
    </div>
    <div class="translation" v-if="translate">
      {{ row.translation }}
    </div>
  </el-form-item>
</template>

<script setup lang="ts">
import { aClick, displayText, textParser } from './index.ts'
import Reading from '../../components/Reading.vue'
import type { TextBase } from './types.ts'
import { useReadingStore } from '../../stores/readingStore.ts'
import { useSettingStore } from '../../stores/settingStore.ts'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import type { WordItem } from '../../types'

const readingStore = useReadingStore()
const activeText = readingStore.activeText

const settingStore = useSettingStore()
const { wordLink, furigana } = storeToRefs(settingStore)

interface LessonRowProps {
  rows?: TextBase[]
  words?: WordItem[]
  translate?: boolean
}

const props = defineProps<LessonRowProps>()

const textView = computed(() => {
  return textParser(props.words, wordLink.value, furigana.value)
})
</script>

<style scoped>
:deep(.el-form-item__label) {
  font-size: 1.2rem;
  font-weight: bolder;
  user-select: none;
  white-space: nowrap;
  color: var(--el-text-color-regular);
  line-height: var(--text-content-line-height);
}

:deep(.el-form-item__content) {
  display: flex;
  align-items: start;
  flex-direction: column;
}

.text-row {
  display: inline;
  letter-spacing: 1px;
  line-height: var(--text-content-line-height);
}

.text-content {
  font-size: 1.2rem;
}

.speaking-active {
  color: var(--el-color-success);
}

.translation {
  font-size: 0.85em;
  color: #999;
  transition: opacity 0.3s ease;
}
</style>
