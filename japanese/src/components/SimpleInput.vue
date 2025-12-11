<template>
  <div class="simple-select-wrapper">
    <el-select
      v-model="selectValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :size="size"
      :class="className"
      :clearable="clearable"
      filterable
      allow-create
      default-first-option
      :reserve-keyword="false"
      @change="handleChange"
      @blur="handleBlur"
      @focus="handleFocus"
      class="simple-select"
      popper-class="simple-select-popper"
    >
      <!-- 历史项：最新在前 -->
      <el-option
        v-for="(item, idx) in historyList"
        :key="item + idx"
        :label="item"
        :value="item"
      >
        <div class="option-row">
          <span class="option-text">{{ item }}</span>
        </div>
      </el-option>
    </el-select>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useCacheStore } from '@/stores/cacheStore'

interface Props {
  modelValue?: string
  placeholder?: string
  clearable?: boolean
  disabled?: boolean
  size?: 'large' | 'default' | 'small'
  className?: string
  cacheId?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '搜索关键字',
  clearable: true,
  disabled: false,
  className: '',
  cacheId: 'default-cache-id',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string]
  blur: [event: Event]
  focus: [event: Event]
}>()

const cacheStore = useCacheStore()

// 下拉输入框的值（字符串）
const selectValue = computed({
  get: () => props.modelValue,
  set: (val: string) => emit('update:modelValue', val),
})

// 历史列表（来自 Pinia，不做持久化）
const historyList = computed(() => cacheStore.getHistory(props.cacheId))

// 事件：惰性记录（只在 change 时）
const handleChange = (val: string) => {
  emit('change', val)
  cacheStore.addHistory(props.cacheId, val)
}

const handleBlur = (e: Event) => emit('blur', e)
const handleFocus = (e: Event) => emit('focus', e)

// 暴露方法
defineExpose({
  clearHistory: () => cacheStore.clearHistory(props.cacheId),
  getHistory: () => cacheStore.getHistory(props.cacheId),
})
</script>

<style scoped>
.simple-select-wrapper {
  width: 100%;
}
.simple-select {
  width: 100%;
}
.option-row {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.option-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.option-delete {
  margin-left: 8px;
}
</style>
