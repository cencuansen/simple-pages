<template>
  <div
    class="index-bar"
    :class="[
      `index-bar--${position}`,
      { 'index-bar--horizontal': isHorizontal },
    ]"
    @mouseleave="clearActive"
  >
    <div
      v-for="(item, index) in normalizedData"
      :key="index"
      class="index-bar__item"
      :class="{ 'index-bar__item--active': activeIndex === index }"
      @click="scrollTo(item.target)"
      @mouseenter="setActive(index)"
    >
      <span class="index-bar__label">{{ item.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, withDefaults } from 'vue'
import type { IndexItem } from './index.ts'

interface Props {
  data: IndexItem[]
  position?: 'left' | 'right' | 'top' | 'bottom'
}

const props = withDefaults(defineProps<Props>(), {
  position: 'right',
})

const activeIndex = ref<number | null>(null)
const isHorizontal = computed(
  () => props.position === 'top' || props.position === 'bottom'
)

// 标准化数据，确保每个项都有target元素
const normalizedData = computed(() => {
  return props.data.map((item) => {
    let target: HTMLElement | null = null
    // 按优先级获取目标元素
    if (item.element) {
      target = item.element
    } else if (item.id) {
      target = document.getElementById(item.id)
    } else if (item.className) {
      const elements = document.getElementsByClassName(item.className)
      if (elements.length > 0) {
        target = elements[0] as HTMLElement
      }
    }

    return {
      ...item,
      target,
    }
  })
})

// 滚动到目标元素
const scrollTo = (target: HTMLElement | null | undefined) => {
  if (!target) return

  target.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  })
}

// 设置当前激活的索引项
const setActive = (index: number) => {
  activeIndex.value = index
}

// 清除激活状态
const clearActive = () => {
  activeIndex.value = null
}

// 处理窗口大小变化，重新定位
const handleResize = () => {
  // 这里可以根据需要添加重新定位的逻辑
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style>
:root {
  --index-bar-width: 25px;
  --index-bar-height: 300px;
  --index-bar-offset: 0;
  --index-bar-item-w: 10px;
  --index-bar-item-h: 10px;
  --index-bar-item-fs: 5px;
}
</style>

<style scoped>
.index-bar {
  position: fixed;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2px;
  z-index: 999;
}

.index-bar--left {
  top: 10%;
  left: var(--index-bar-offset);
  width: var(--index-bar-width);
  max-height: var(--index-bar-height);
}

.index-bar--right {
  top: 10%;
  right: var(--index-bar-offset);
  width: var(--index-bar-width);
  max-height: var(--index-bar-height);
}

.index-bar--top {
  top: var(--index-bar-offset);
  left: 50%;
  flex-direction: row;
  transform: translateX(-50%);
  height: var(--index-bar-width);
  max-width: var(--index-bar-height);
}

.index-bar--bottom {
  left: 50%;
  bottom: var(--index-bar-offset);
  flex-direction: row;
  transform: translateX(-50%);
  height: var(--index-bar-width);
  max-width: var(--index-bar-height);
}

.index-bar--horizontal {
  flex-direction: row;
}

.index-bar__item {
  width: var(--index-bar-item-w);
  height: var(--index-bar-item-w);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 4px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: var(--index-bar-item-fs);
  font-weight: 500;
  color: #333;
  position: relative;
  background-color: #666666;
}

.index-bar__item:hover {
  transform: scale(1.1);
}

.index-bar__item--active {
  background-color: #2196f3;
  color: white;
  transform: scale(1.15);
}

.index-bar__label {
  position: absolute;
  white-space: nowrap;
  color: white;
  border-radius: 4px;
  font-size: 10px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  pointer-events: none;
}

.index-bar__item--active .index-bar__label {
  opacity: 1;
  visibility: visible;
}

@media (max-width: 768px) {
  .index-bar__item {
    font-size: 0;
  }
}
</style>