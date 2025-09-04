<template>
  <div
    class="index-bar"
    :class="[
      `index-bar--${position}`,
      { 'index-bar--horizontal': isHorizontal },
    ]"
    @mouseleave="clearActive"
    @mousedown="startInteraction"
    @touchstart="startInteraction"
    ref="indexBarRef"
  >
    <div
      v-for="(item, index) in normalizedData"
      :key="index"
      class="index-bar__item"
      :class="{
        'index-bar__item--active': activeIndex === index,
        'index-bar__item--current': false,
      }"
      @click="scrollTo(item.target)"
      @mouseenter="setActive(index)"
    >
      <span v-if="item.label" class="index-bar__label">{{ item.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  onUnmounted,
  withDefaults,
  nextTick,
} from 'vue'

interface IndexItem {
  id?: string
  className?: string
  element?: HTMLElement | null
  label?: string
  target?: HTMLElement | null

  [key: string]: any
}

interface Props {
  data: IndexItem[]
  position?: 'left' | 'right' | 'top' | 'bottom'
  highlightColor?: string
  hoverColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  position: 'right',
  highlightColor: '#2196f3',
  hoverColor: '#42a5f5',
})

const activeIndex = ref<number | null>(null)
const currentIndex = ref<number | null>(null)
const isInteracting = ref(false)
const indexBarRef = ref<HTMLElement | null>(null)
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
  if (!isInteracting.value) {
    activeIndex.value = null
  }
}

// 开始交互（鼠标按下或触摸开始）
const startInteraction = (e: MouseEvent | TouchEvent) => {
  isInteracting.value = true
  if (e instanceof MouseEvent) {
    document.addEventListener('mousemove', handleInteractionMove)
    document.addEventListener('mouseup', endInteraction)
  } else {
    document.addEventListener('touchmove', handleInteractionMove, {
      passive: false,
    })
    document.addEventListener('touchend', endInteraction)
  }
  handleInteractionMove(e)
}

// 处理交互移动
const handleInteractionMove = (e: MouseEvent | TouchEvent) => {
  if (!indexBarRef.value) return

  const rect = indexBarRef.value.getBoundingClientRect()
  let clientY, clientX

  if (e instanceof MouseEvent) {
    clientY = e.clientY
    clientX = e.clientX
  } else {
    clientY = e.touches[0].clientY
    clientX = e.touches[0].clientX
  }

  // 计算相对于索引条的位置
  const relativePos = isHorizontal.value
    ? (clientX - rect.left) / rect.width
    : (clientY - rect.top) / rect.height

  // 根据位置计算激活的索引
  const index = Math.floor(relativePos * normalizedData.value.length)

  if (index >= 0 && index < normalizedData.value.length) {
    setActive(index)
    scrollTo(normalizedData.value[index].target)
  }

  // 阻止默认行为防止页面滚动
  if (e.type === 'touchmove') {
    e.preventDefault()
  }
}

// 结束交互
const endInteraction = () => {
  isInteracting.value = false
  activeIndex.value = null
  document.removeEventListener('mousemove', handleInteractionMove)
  document.removeEventListener('mouseup', endInteraction)
  document.removeEventListener('touchmove', handleInteractionMove)
  document.removeEventListener('touchend', endInteraction)
}

// 更新当前高亮的索引项
const updateCurrentIndex = () => {
  if (normalizedData.value.length === 0) return
  const scrollPosition = window.scrollY + 100 // 添加一些偏移量
  for (let i = normalizedData.value.length - 1; i >= 0; i--) {
    const target = normalizedData.value[i].target
    if (target && target.offsetTop <= scrollPosition) {
      currentIndex.value = i
      break
    }
  }
}

// 处理窗口大小变化，重新定位
const handleResize = () => {
  updateCurrentIndex()
}

// 处理滚动事件
const handleScroll = () => {
  if (!isInteracting.value) {
    updateCurrentIndex()
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  window.addEventListener('scroll', handleScroll)

  // 等待DOM更新后计算初始当前索引
  nextTick(() => {
    updateCurrentIndex()
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('scroll', handleScroll)
  endInteraction()
})
</script>

<style>
:root {
  --index-bar-width: 12px;
  --index-bar-height: 300px;
  --index-bar-item-w: calc(var(--index-bar-width) - 2px);
  --index-bar-item-h: var(--index-bar-item-w);
  --index-bar-item-fs: calc(0.5 * var(--index-bar-item-w));
  --index-bar-bg: inherit;
  --index-bar-hover-bg: #333;
  --index-bar-item-bg: #666;
  --index-bar-item-hover-bg: #666;
  --index-bar-item-active-bg: #666;
  --index-bar-item-current-bg: #666;
}

@media (min-width: 800px) {
  :root {
    --index-bar-offset: calc((100vw - 768px) * 0.25);
  }
}

@media (max-width: 768px) {
  :root {
    --index-bar-offset: 0;
  }
}
</style>

<style scoped>
.index-bar {
  position: fixed;
  display: flex;
  user-select: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4px;
  z-index: 999;
  border-radius: calc(0.5 * var(--index-bar-width));
  background-color: var(--index-bar-bg);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
  transition: background-color 0.2s ease;
}

.index-bar:hover,
.index-bar:active {
  background-color: var(--index-bar-hover-bg);
}

.index-bar--left {
  top: 50%;
  transform: translateY(-50%);
  left: var(--index-bar-offset);
  width: var(--index-bar-width);
  max-height: var(--index-bar-height);
}

.index-bar--right {
  top: 50%;
  transform: translateY(-50%);
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
  height: var(--index-bar-item-h);
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
  background-color: var(--index-bar-item-bg);
}

.index-bar__item:hover {
  background-color: var(--index-bar-item-hover-bg);
  /*transform: scale(1.1);*/
}

.index-bar__item--active {
  color: white;
  transform: scale(1.15);
  /*background-color: var(--index-bar-item-active-bg);*/
}

.index-bar__item--current {
  background-color: var(--index-bar-item-current-bg);
  color: white;
}

.index-bar__label {
  position: absolute;
  white-space: nowrap;
  padding: 4px 8px;
  background-color: #333;
  color: white;
  border-radius: 4px;
  font-size: 12px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  pointer-events: none;
}

.index-bar--left .index-bar__label {
  right: 100%;
  margin-right: 8px;
}

.index-bar--right .index-bar__label {
  left: 100%;
  margin-left: 8px;
}

.index-bar--top .index-bar__label {
  bottom: 100%;
  margin-bottom: 8px;
}

.index-bar--bottom .index-bar__label {
  top: 100%;
  margin-top: 8px;
}

.index-bar__item--active .index-bar__label,
.index-bar__item--current .index-bar__label {
  opacity: 1;
  visibility: visible;
}

@media (max-width: 768px) {
  .index-bar__item {
    margin: 5px;
  }

  /* 触摸设备优化 */
  .index-bar {
    padding: 6px 3px;
  }

  .index-bar__item:active {
    /*background-color: var(--index-bar-item-active-bg);*/
    transform: scale(1.15);
  }
}
</style>