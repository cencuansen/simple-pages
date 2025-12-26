<template>
  <div
    class="index-bar"
    :class="[
      `index-bar--${position}`,
      { 'index-bar--horizontal': isHorizontal },
    ]"
  >
    <div
      :id="item.ele?.id"
      v-for="item in elements"
      :key="item.key"
      class="ib__item"
      :class="{
        'ib__item--active': currentKey === item.key,
      }"
      @click="scrollTo(item)"
      @mouseenter="onMouseEnter(item)"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, withDefaults } from 'vue'
import { newTextId, scrollToEle } from '@/utils/common.ts'
import type { ElementInfo, Props } from '@/types/indexBar.ts'

const props = withDefaults(defineProps<Props>(), {
  position: 'right',
})

const minGap = 100
const elements = ref<ElementInfo[]>([])
const currentKey = ref<string>()

const container = ref<Element | null>(null)

const isHorizontal = computed(
  () => props.position === 'top' || props.position === 'bottom'
)

const scrollTo = (target: ElementInfo | null | undefined) => {
  if (!target) return
  target?.ele && scrollToEle(target?.ele)
  currentKey.value = target.key
}

const buildInfo = () => {
  if (!container.value) return []
  elements.value = Array.from(container.value.children)
    .filter((ele: Element) => {
      return (ele.getBoundingClientRect().height || 0) > minGap
    })
    .map((ele) => {
      const key = `ib_${newTextId()}`
      return {
        key: key,
        ele,
      } as ElementInfo
    })
}

const updateCurrentKey = () => {
  if (!container.value) return
  const scrollPosition = container.value.scrollTop
  let sum = 0
  let last = null
  for (let i = 0; i < elements.value.length; i++) {
    let h = elements.value[i].ele?.getBoundingClientRect().height || 0
    sum += h
    if (scrollPosition < sum) {
      last = elements.value[i]
      break
    }
  }
  currentKey.value = last?.key
}

interface HotkeyRef {
  [key: string]: Element
}

const isCtrlPressed = ref(false)

const hotkeyRefMap = computed<HotkeyRef>(() => {
  const refs: { [key: string]: Element } = {}
  elements.value
    .map((item: ElementInfo, index: number) => {
      const key: string = `${index + 1}`
      return [key, item.ele]
    })
    .forEach((arr) => {
      const key = arr[0] as string
      refs[key] = arr[1] as Element
    })
  return refs
})

const onMouseEnter = (item: ElementInfo) => {
  if (isCtrlPressed.value) {
    scrollTo(item)
  }
}

const onKeydown = (event: KeyboardEvent) => {
  isCtrlPressed.value = event.ctrlKey
}

const onKeyup = (event: KeyboardEvent) => {
  // 1. 更新 Ctrl 键的状态（用于 UI 反馈等）
  isCtrlPressed.value = event.ctrlKey

  // 2. 核心逻辑：如果没按下 Alt 键，则不触发滚动逻辑
  if (!event.altKey) {
    return
  }

  event.preventDefault()

  // 3. 匹配对应的按键
  // 建议：如果 hotkeyRefMap 的 key 是大写的（如 'A'），
  // 在按下 Ctrl 时 event.key 可能是 'a'，使用 .toLowerCase() 或 .toUpperCase() 匹配更稳健
  const targetKey = event.key;

  if (Object.keys(hotkeyRefMap.value).includes(targetKey)) {
    // 阻止浏览器默认行为（例如 Ctrl+F 搜索，Ctrl+S 保存等）
    event.preventDefault()

    hotkeyRefMap.value[targetKey]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
    })
  }
}

const unitFns = () => {
  buildInfo()
  updateCurrentKey()
  container.value &&
    container.value.addEventListener('scrollend', updateCurrentKey)
}

onMounted(() => {
  container.value = document.querySelector(props.bind)

  unitFns()

  const observer = new MutationObserver(unitFns)

  container.value &&
    observer.observe(container.value, {
      childList: true, // 监听子节点变化
      subtree: true, // 监听子树变化
      attributes: true, // 监听属性变化
    })

  document.addEventListener('keydown', onKeydown)
  document.addEventListener('keyup', onKeyup)
})
</script>

<style>
:root {
  --ib-width: calc(var(--width-10) * 1.7);
  --ib-height: 80px;
  --ib-item-w: calc(var(--ib-width) * 0.5);
  --ib-item-active-w: calc(var(--ib-item-w) * 1.4);
  --ib-item-h: var(--ib-item-w);
  --ib-item-active-h: var(--ib-item-active-w);
  --ib-item-fs: calc(0.5 * var(--ib-item-w));
  --ib-bg: inherit;
  --ib-item-bg: #666;
  --ib-item-active-bg: var(--el-color-primary);
}
</style>

<style scoped>
.index-bar {
  box-sizing: border-box;
  position: fixed;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  user-select: none;
  z-index: 999;
  /*border-radius: calc(0.5 * var(--ib-width));*/
  /*background-color: var(--ib-bg);*/
  /*box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);*/
  /*backdrop-filter: blur(5px);*/
  transition: background-color 0.2s ease;
}

.index-bar--left {
  top: 50%;
  transform: translateY(-50%);
  left: var(--ib-offset);
  width: var(--ib-width);
  height: var(--ib-height);
}

.index-bar--right {
  top: 50%;
  transform: translateY(-50%);
  right: var(--ib-offset);
  width: var(--ib-width);
  height: var(--ib-height);
}

.index-bar--top {
  top: var(--ib-offset);
  left: 50%;
  flex-direction: row;
  transform: translateX(-50%);
  height: var(--ib-width);
  width: var(--ib-height);
}

.index-bar--bottom {
  left: 50%;
  bottom: var(--ib-offset);
  flex-direction: row;
  transform: translateX(-50%);
  height: var(--ib-width);
  width: var(--ib-height);
}

.index-bar--horizontal {
  flex-direction: row;
}

.ib__item {
  width: var(--ib-item-w);
  height: var(--ib-item-h);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: var(--ib-item-bg);
}

.ib__item--active {
  width: var(--ib-item-active-w);
  height: var(--ib-item-active-h);
  background-color: var(--ib-item-active-bg);
}
</style>
