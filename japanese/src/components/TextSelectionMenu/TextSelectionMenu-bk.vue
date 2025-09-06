<template>
  <div
    v-if="isVisible"
    ref="menuRef"
    :style="menuStyle"
    class="text-selection-menu"
    @click.stop
  >
    <div
      v-for="(item, index) in menuItems"
      :key="index"
      :class="['menu-item', { disabled: item.disabled }]"
      @click="!item.disabled && handleMenuItemClick(item)"
      @mouseenter="
        !item.disabled &&
        ((e: any) =>
          (e.target && (e.target.style.background = 'var(--el-bg-color-overlay)')))
      "
      @mouseleave="
        !item.disabled &&
        ((e: any) => (e.currentTarget.style.background = 'var(--el-bg-color)'))
      "
    >
      <span v-if="item.icon" style="font-size: 16px">{{ item.icon }}</span>
      {{ item.label }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface MenuItem {
  label: string
  action: (selectedText: string, event: MouseEvent) => void
  icon?: string
  disabled?: boolean
}

const props = defineProps<{
  selectedText: string
  x: number
  y: number
  maxWidth?: number
}>()

const isVisible = ref(false)
const menuRef = ref<HTMLElement | null>(null)
const menuStyle = ref({
  position: 'fixed',
  left: '0px',
  top: '0px',
  opacity: '0',
  transform: 'translateY(-10px)',
})

const menuItems = ref<MenuItem[]>([
  {
    label: '复制',
    icon: '📋',
    action: (text: string) => {
      navigator.clipboard.writeText(text)
    },
  },
  {
    label: '查询',
    icon: '🔍',
    action: (text: string) => {
      window.open(
        `https://www.google.com/search?q=${encodeURIComponent(text)}`,
        '_blank'
      )
    },
  },
])

const computedMenuStyle = computed(() => {
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const menuRect = menuRef.value?.getBoundingClientRect()

  let finalX = props.x
  let finalY = props.y

  if (menuRect) {
    if (finalX + menuRect.width > viewportWidth) {
      finalX = viewportWidth - menuRect.width - 10
    }
    if (finalY + menuRect.height > viewportHeight) {
      finalY = viewportHeight - menuRect.height - 10
    }
  }

  return {
    ...menuStyle.value,
    left: `${finalX}px`,
    top: `${finalY}px`,
    display: isVisible.value ? 'block' : 'none',
    minWidth: '140px',
    maxWidth: `${props.maxWidth || 200}px`,
    background: 'var(--el-bg-color)',
    border: '1px solid var(--el-border-color-light)',
    borderRadius: '6px',
    padding: '6px 0',
    zIndex: 10000,
    transition: 'opacity 0.15s ease, transform 0.15s ease',
  }
})

const showMenu = () => {
  isVisible.value = true
  requestAnimationFrame(() => {
    menuStyle.value.opacity = '1'
    menuStyle.value.transform = 'translateY(0)'
  })
}

const hideMenu = () => {
  menuStyle.value.opacity = '0'
  menuStyle.value.transform = 'translateY(-10px)'
  setTimeout(() => {
    isVisible.value = false
  }, 150)
}

const handleMenuItemClick = (item: MenuItem) => {
  item.action(props.selectedText, new MouseEvent('click'))
  hideMenu()
}

const handleClickOutside = (e: MouseEvent) => {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
    hideMenu()
  }
}

onMounted(() => {
  if (props.selectedText) {
    showMenu()
    document.addEventListener('click', handleClickOutside, true)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside, true)
})

defineExpose({ showMenu, hideMenu })
</script>

<style scoped>
.text-selection-menu {
  font-size: 14px;
}

.menu-item {
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.menu-item:not(.disabled) {
  cursor: pointer;
}

.menu-item.disabled {
  cursor: not-allowed;
}
</style>
