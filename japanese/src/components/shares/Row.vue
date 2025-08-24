<template>
  <div class="row">
    <div class="inner">
      <div v-for="(child, index) in slotChildren" :key="index" class="row-item">
        <component :is="child" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'

const slots = useSlots()
const slotChildren = computed(() => {
  // 获取默认插槽的子节点
  const children = slots.default?.() || []
  // 过滤掉文本节点等
  return children.filter((child) => {
    return child.type !== Comment && typeof child.type === 'object'
  })
})
</script>

<style scoped>
.row {
  overflow-y: scroll;
  height: var(--single-row-header-height);
}

.inner {
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--gap12);
  max-width: var(--content-max-width);
  height: var(--single-row-header-height);
}

.row-item {
  flex: 1;
}
</style>
