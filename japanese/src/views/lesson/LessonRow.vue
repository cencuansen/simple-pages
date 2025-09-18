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
          v-if="isNormalText(row.content)"
          class="row-icon"
          :row-item="row as TextBase"
          @click="speak(row.textId)"
        />
        <el-text
          class="row-text"
          :class="{
            active: activeText(row.textId),
          }"
          v-html="textView(nonTextProcess(row.content))"
        />
      </div>
      <div class="translate" v-if="translate && isNormalText(row.content)">
        <el-text>{{ row.translation }}</el-text>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { displayText } from '../../utils/lesson.ts'
import Reading from '../../components/Reading.vue'
import type { TextBase } from '../../types/lesson.ts'
import { useReadingStore } from '@/stores/readingStore.ts'

const readingStore = useReadingStore()
const activeText = readingStore.activeText

interface LessonRowProps {
  rows?: TextBase[]
  translate?: boolean
  textView: Function
}

defineProps<LessonRowProps>()

const speak = async (id: string) => {
  const target = document.querySelector(`#${id}`)
  if (!target) return
  target.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
    inline: 'nearest',
  })
}

const nonTextPatten = /(\{(\w+)\|([^}]+)\})/

const isNormalText = (text: string) => {
  return !nonTextPatten.test(text)
}

const nonTextProcess = (text: string): string => {
  if (!text) return text
  const match = text.match(nonTextPatten)
  if (match) {
    const matchedText = match[1]
    const type = match[2]
    const filename = match[3]

    if (type === 'img') {
      const imageUrlBase: string = import.meta.env.VITE_IMAGE_BASE
      const real = `${imageUrlBase}/${filename}`
      text = text.replace(matchedText, real)
    }
  }
  return text
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
  width: 2em;
  display: inline-block;
  text-wrap: nowrap;
  overflow-x: scroll;
  user-select: none;
  color: #999;
  text-align: left;
  vertical-align: baseline;
}

.left::-webkit-scrollbar {
  display: none;
}

.right {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.row {
  display: inline;
}

.row-icon,
.row-text {
  align-self: baseline;
}

.row-icon + .row-text {
  margin-left: 0.1em;
}

.row-text {
  font-size: 1.1em;
  letter-spacing: 1px;
}

.translate {
  font-size: 0.75em;
}
</style>
