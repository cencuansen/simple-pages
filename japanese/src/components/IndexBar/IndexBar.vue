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
import { newTextId } from '@/utils'
import type { ElementInfo, Props } from '../../types/indexBar.ts'

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
  target?.ele &&
    target?.ele.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })

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
  isCtrlPressed.value = event.ctrlKey
  if (event.ctrlKey || event.altKey || event.shiftKey || event.metaKey) {
    return
  }
  if (Object.keys(hotkeyRefMap.value).includes(event.key)) {
    hotkeyRefMap.value[event.key]?.scrollIntoView({
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
  --ib-width: var(--width-12);
  --ib-height: 80px;
  --ib-item-w: calc(var(--ib-width) * 0.5);
  --ib-item-active-w: calc(var(--ib-item-w) * 1.4);
  --ib-item-h: var(--ib-item-w);
  --ib-item-active-h: var(--ib-item-active-w);
  --ib-item-fs: calc(0.5 * var(--ib-item-w));
  --ib-bg: inherit;
  --ib-hover-bg: #333;
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

.index-bar:hover,
.index-bar:active {
  background-color: var(--ib-hover-bg);
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

.ib__label {
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

.index-bar--left .ib__label {
  right: 100%;
  margin-right: 8px;
}

.index-bar--right .ib__label {
  left: 100%;
  margin-left: 8px;
}

.index-bar--top .ib__label {
  bottom: 100%;
  margin-bottom: 8px;
}

.index-bar--bottom .ib__label {
  top: 100%;
  margin-top: 8px;
}

.ib__item--active .ib__label,
.ib__item--current .ib__label {
  opacity: 1;
  visibility: visible;
}
</style>
