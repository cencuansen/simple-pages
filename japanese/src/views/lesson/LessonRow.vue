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
        @click="wordRefer"
      ></el-text>
    </div>
    <div class="translation" v-if="translate">
      {{ row.translation }}
    </div>
  </el-form-item>
</template>

<script setup lang="ts">
import { wordRefer, displayText } from './index.ts'
import Reading from '../../components/Reading.vue'
import type { TextBase } from './types.ts'
import { useReadingStore } from '../../stores/readingStore.ts'

const readingStore = useReadingStore()
const activeText = readingStore.activeText

interface LessonRowProps {
  rows?: TextBase[]
  translate?: boolean
  textView: Function
}

defineProps<LessonRowProps>()
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
