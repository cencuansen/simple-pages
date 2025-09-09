<template>
  <el-form-item
    :label="displayText(row.speaker)"
    class="message"
    v-for="row in rows"
    :key="row.textId"
  >
    <div class="text-row">
      <!--原文-->
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
    <!--译文-->
    <div class="translation-line" v-if="translate">
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
  container?: any
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
:deep(.message .el-form-item__content) {
  display: flex;
  flex-direction: column;
  align-items: start;
}

.text-row {
  position: relative;
  display: inline;
  align-items: center;
  letter-spacing: 1px;
  line-height: var(--text-content-line-height);
}

.text-content {
  display: inline;
  font-size: 1.2rem;
}

.speaking-active {
  color: var(--el-color-success);
}

.translation-line {
  font-size: 0.85em;
  color: #999;
  transition: opacity 0.3s ease;
}
</style>
