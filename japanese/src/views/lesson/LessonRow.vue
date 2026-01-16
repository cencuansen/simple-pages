<template>
  <div
    :id="row.textId"
    class="lesson-row"
    v-for="row in rows"
    :key="row.textId"
    v-loading="!getContent(row.textId) || !getTranslation(row.textId)"
  >
    <el-text class="left" v-if="row.speaker">
      {{ displayText(row.speaker.trim()) }}
    </el-text>
    <div class="right">
      <div class="row" :class="{ 'justify-right': rightRows?.has(row.textId) }">
        <Reading
          v-if="!isResource(getContent(row.textId))"
          class="row-icon"
          :row-item="buildContent(row.textId) as TextBase"
        />
        <el-text
          class="row-text"
          :style="[
            activeText(row.textId) ? { color: 'var(--el-color-primary)' } : {},
          ]"
          v-html="textView(textPreprocess(getContent(row.textId), row.textId))"
        />
        <el-text
          v-if="settingStore.devMode"
          class="text-id"
          @click="copy(row.textId)"
        >
          &nbsp;{{ row.textId }}
        </el-text>
      </div>
      <div
        class="translate indentation"
        :class="{ 'justify-right': rightRows?.has(row.textId) }"
        v-if="translate && !isResource(getContent(row.textId))"
      >
        <span>{{ getTranslation(row.textId) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { displayText } from '@/utils/lesson.ts'
import Reading from '@/components/Reading.vue'
import type { TextBase } from '@/types/lesson.ts'
import { useLessonStore } from '@/stores/lessonStore.ts'
import { useReadingStore } from '@/stores/readingStore.ts'
import { useSettingStore } from '@/stores/settingStore.ts'
import { ElNotification } from 'element-plus'

const lessonStore = useLessonStore()
const getContent = lessonStore.getContent
const getTranslation = lessonStore.getTranslation
const buildContent = lessonStore.buildContent

const readingStore = useReadingStore()
const activeText = readingStore.activeText

const settingStore = useSettingStore()

const rightRows = ref<Map<string, boolean>>(new Map())

interface LessonRowProps {
  rows?: TextBase[]
  translate?: boolean
  textView: Function
}

defineProps<LessonRowProps>()

// 正则表达式匹配resource资源格式
const resourceRegex = /^\[resource:([a-zA-Z]+):([^\]]+)]$/

// 判断文本是否是resource资源的函数
function isResource(text: string): boolean {
  return resourceRegex.test(text)
}

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function isSafeFilename(filename: string): boolean {
  // 只允许字母、数字、下划线、点号、短横线
  return /^[a-zA-Z0-9._-]+$/.test(filename)
}

const textPreprocess = (text: string, id: string): string => {
  if (!text) return ''

  if (/^\s{2,}/.test(text)) {
    console.log(id)
    rightRows.value?.set(id, true)
  }

  const match = text.match(resourceRegex)
  if (match) {
    const type = match[1]
    const filename = match[2]

    if (type === 'img' && isSafeFilename(filename)) {
      const imageUrlBase: string = import.meta.env.VITE_IMAGE_BASE
      const safeFilename = escapeHTML(filename)
      const safeUrl = `${imageUrlBase}/${encodeURIComponent(filename)}`
      return `<img src="${safeUrl}" alt="${safeFilename}" />`
    }

    // 非法文件名或非 img 类型，直接转义输出
    return escapeHTML(text)
  }

  // 默认情况：转义所有文本
  return escapeHTML(text)
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
  width: 4rem;
  font-size: 2rem;
  display: inline-block;
  text-wrap: nowrap;
  overflow-x: scroll;
  user-select: none;
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

.left,
.right {
  align-self: baseline;
}

.row-icon {
  margin-right: 0.5rem;
}

.row-text {
  width: 100%;
  font-size: 2rem;
  letter-spacing: 0.2rem;
}

:deep(.row-text img) {
  width: 100%;
  object-fit: contain;
}

.text-id {
  user-select: none;
  font-size: 1.2rem;
  color: #999;
}

.translate {
  font-size: 1.5rem;
  color: #999;
}

.justify-right {
  display: inline-block;
  text-align: right;
}
</style>
