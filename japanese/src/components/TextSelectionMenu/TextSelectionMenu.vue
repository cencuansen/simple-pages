<template>
  <div
    class="selection-menu"
    :style="{
      top: toTop,
      left: toLeft,
      width: appendPxUnit(width),
      height: appendPxUnit(height),
    }"
  >
    <div class="selected-text">{{ selectedText }}</div>
    <div class="menu-item" @click="useDict">查 {{ dict?.name || '词典' }}</div>
    <!--    <div class="menu-item">查课文</div>-->
    <!--    <div class="menu-item">查词汇</div>-->
    <!--    <div class="menu-item">查词汇(jlpt)</div>-->
    <!--    <div class="menu-item">查语法</div>-->
    <!--    <div class="menu-item">查语法(jlpt)</div>-->
    <!--    <div class="menu-item">查活用</div>-->
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed, type ComputedRef } from 'vue'
import { useDictionaryStore } from '../../stores/dictionaryStore.ts'
import type { Dictionary } from '../Dictionary/types.ts'
import { toUrl } from '@/components/Dictionary/utils.ts'

const dictionaryStore = useDictionaryStore()
const { getOne } = dictionaryStore

const props = defineProps<{
  selectedText: string
  x: number
  y: number
  width: number
  height: number
}>()

const dict = ref<Dictionary | undefined>()

const appendPxUnit = (n: number) => `${n}px`

const toTop: ComputedRef<string> = computed(() => {
  let top = props.y
  return appendPxUnit(top)
})
const toLeft: ComputedRef<string> = computed(() => {
  let left = props.x
  return appendPxUnit(left)
})

const useDict = () => {
  if (!dict.value) {
    return
  }
  const url = toUrl(props.selectedText, dict.value)
  window.open(url)
}

onMounted(() => {
  dict.value = getOne()
})

onUnmounted(() => {})
</script>

<style scoped>
.selection-menu {
  position: absolute;
  display: flex;
  flex-direction: column;
  gap: var(--gap12);
  padding: 10px;
  border-radius: 5px;
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
}

.selected-text {
  color: var(--el-color-info);
  background-color: #000;
}

.menu-item,
.selected-text {
  width: 100%;
  border-radius: 5px;
  padding: 5px;
  display: flex;
  align-items: center;
  text-wrap: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu-item:hover {
  background-color: var(--el-bg-color-overlay);
}

.menu-item:not(.disabled) {
  cursor: pointer;
}

.menu-item.disabled {
  cursor: not-allowed;
}
</style>
