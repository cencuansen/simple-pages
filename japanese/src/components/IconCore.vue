<template>
  <el-icon :class="{ disabled }" @click="handleClick">
    <slot></slot>
  </el-icon>
</template>

<script setup lang="ts">
const props = defineProps<{
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const handleClick = (e: MouseEvent) => {
  if (props.disabled) return
  emit('click', e)
}
</script>

<style scoped>
.el-icon {
  font-size: 18px;
  cursor: pointer;
  color: #63a35c;
}

.disabled {
  color: #666;
  cursor: not-allowed;
}
</style>
