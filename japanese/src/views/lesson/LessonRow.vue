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
          v-if="!isResource(row.content)"
          class="row-icon"
          :row-item="row as TextBase"
          @click="speak(row.textId)"
        />
        <el-text
          class="row-text"
          :class="{
            active: activeText(row.textId),
          }"
          v-html="textView(nonTextProcess(removeSpace(row.content)))"
        />
        <el-text v-if="true" class="text-id" @click="copy(row.textId)">
          {{ row.textId }}
        </el-text>
      </div>
      <div class="translate" v-if="translate && !isResource(row.content)">
        <el-text>{{ row.translation }}</el-text>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { displayText, removeSpace } from '../../utils/lesson.ts'
import Reading from '../../components/Reading.vue'
import type { TextBase } from '../../types/lesson.ts'
import { useReadingStore } from '@/stores/readingStore.ts'
import { ElNotification } from 'element-plus'

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

// 正则表达式匹配resource资源格式
const resourceRegex = /^\[resource:([a-zA-Z]+):([^\]]+)\]$/

// 判断文本是否是resource资源的函数
function isResource(text: string): boolean {
  return resourceRegex.test(text)
}

const nonTextProcess = (text: string): string => {
  if (!text) return text
  const match = text.match(resourceRegex)
  if (match) {
    const type = match[1]
    const filename = match[2]

    if (type === 'img') {
      const imageUrlBase: string = import.meta.env.VITE_IMAGE_BASE
      const real = `${imageUrlBase}/${filename}`
      text = `<img src="${real}" alt="${filename}" />`
    }
  }
  return text
}

const copy = async (text: string) => {
  await navigator.clipboard.writeText(text)
  ElNotification.success(`Copied!`)
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

.row-text > * {
  width: 100%;
  min-width: var(--content-max-width);
}

.text-id {
  font-size: 0.8em;
  color: #666666;
}

.translate {
  font-size: 0.75em;
}
</style>
