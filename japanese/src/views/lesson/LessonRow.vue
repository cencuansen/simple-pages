<template>
  <div
    :id="row.textId"
    class="lesson-row"
    v-for="row in rows"
    :key="row.textId"
  >
    <div class="left" v-if="row.speaker">
      {{ displayText(row.speaker.trim()) }}
    </div>
    <div class="right">
      <div class="row">
        <Reading
          class="row-icon"
          :row-item="row as TextBase"
          @click="click(row.textId)"
        />
        <el-text
          class="row-text"
          :class="{
            active: activeText(row.textId),
          }"
          v-html="textView(row.content)"
        />
      </div>
      <div class="translation" v-if="translate">
        <el-text>{{ row.translation }}</el-text>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { displayText } from './index.ts'
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

const click = async (id: string) => {
  const target = document.querySelector(`#${id}`)
  if (!target) return
  target.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
    inline: 'nearest',
  })
}
</script>

<style scoped>
.lesson-row {
  display: flex;
  align-items: baseline;
  gap: var(--gap12);
  margin-bottom: var(--gap12);
  line-height: 2.3;
}

.left {
  width: 35px;
  flex-shrink: 1;
  text-wrap: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  user-select: none;
  color: #999;
  font-weight: bold;
  display: flex;
  align-items: start;
}

.right {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.row {
  display: flex;
  align-items: baseline;
  gap: calc(var(--gap12) * 0.4);
}

.row-icon,
.row-text {
  align-self: baseline;
}

.row-text {
  font-size: 1.25em;
  letter-spacing: 1px;
}

.translation {
  font-size: 0.75em;
  margin-left: 2em;
}

/*:deep(.el-form-item__label) {
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

:deep(.anchor-link),
:deep(ruby) {
  margin: calc(0.2 * var(--gap12));
}

:deep(.anchor-link ruby),
:deep(ruby .anchor-link) {
  margin: 0;
}

.translation {
  font-size: 0.85em;
  color: #999;
  transition: opacity 0.3s ease;
}*/
</style>
