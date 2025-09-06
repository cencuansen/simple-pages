<!-- TextSelectionMenu.vue -->
<template>
  <div
    ref="menuRef"
    class="text-selection-menu"
    :style="{
      left: position.x + 'px',
      top: position.y + 'px',
      display: visible ? 'block' : 'none',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(-10px)',
    }"
  >
    <div
      v-for="(item, index) in menuItems"
      :key="index"
      class="menu-item"
      :class="{ disabled: item.disabled, divider: item.divider }"
      @click="!item.disabled && !item.divider && handleItemClick(item, $event)"
      @mouseenter="
        !item.disabled && !item.divider && onMouseEnter($event.target)
      "
      @mouseleave="
        !item.disabled && !item.divider && onMouseLeave($event.target)
      "
    >
      <span v-if="item.icon" class="menu-item-icon">{{ item.icon }}</span>
      <span class="menu-item-label">{{ item.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

interface MenuItem {
  label: string
  action: (selectedText: string, event: MouseEvent) => void
  icon?: string
  disabled?: boolean
  divider?: boolean
}

interface Position {
  x: number
  y: number
}

const props = defineProps<{
  menuItems: MenuItem[]
  selectedText: string
  triggerPosition: Position
  maxWidth?: number
}>()

const emit = defineEmits<{
  (e: 'itemClick', item: MenuItem, event: MouseEvent): void
  (e: 'close'): void
}>()

const menuRef = ref<HTMLElement | null>(null)
const visible = ref(false)
const position = ref<Position>({ x: 0, y: 0 })

// 计算调整后的位置，确保不超出视口边界
const adjustPosition = () => {
  if (!menuRef.value) return props.triggerPosition

  const menuRect = menuRef.value.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  let x = props.triggerPosition.x
  let y = props.triggerPosition.y

  // 水平方向调整
  if (x + menuRect.width > viewportWidth) {
    x = viewportWidth - menuRect.width - 10
  }

  // 垂直方向调整
  if (y + menuRect.height > viewportHeight) {
    y = viewportHeight - menuRect.height - 10
  }

  // 确保位置不小于0
  x = Math.max(10, x)
  y = Math.max(10, y)

  return { x, y }
}



// 初始化菜单位置
onMounted(async () => {
  await nextTick()
  position.value = adjustPosition()
  visible.value = true

  // 添加点击外部关闭菜单的事件监听
  document.addEventListener('click', handleClickOutside, true)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside, true)
})

const handleClickOutside = (e: MouseEvent) => {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
    emit('close')
  }
}

const handleItemClick = (item: MenuItem, event: MouseEvent) => {
  item.action(props.selectedText, event)
  emit('close')
}

const onMouseEnter = (target: EventTarget | null) => {
  if (target && target instanceof HTMLElement) {
    target.style.background = 'var(--el-bg-color-overlay)'
  }
}

const onMouseLeave = (target: EventTarget | null) => {
  if (target && target instanceof HTMLElement) {
    target.style.background = 'var(--el-bg-color)'
  }
}
</script>

<style scoped>
.text-selection-menu {
  position: fixed;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  padding: 6px 0;
  z-index: 10000;
  min-width: 140px;
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.menu-item {
  padding: 8px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: inherit;
  transition: background-color 0.1s ease;
}

.menu-item.disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.menu-item.divider {
  height: 1px;
  background: var(--el-border-color-light);
  margin: 4px 0;
  padding: 0;
  cursor: default;
}

.menu-item-icon {
  font-size: 16px;
}
</style>
