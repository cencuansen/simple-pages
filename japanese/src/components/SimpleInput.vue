<template>
  <el-input
    v-model.trim="inputValue"
    :class="className"
    :clearable="clearable"
    :disabled="disabled"
    :maxlength="maxlength"
    :placeholder="placeholder"
    :show-word-limit="showWordLimit"
    :size="size"
    :style="style"
    class="simple-input"
    @blur="handleBlur"
    @change="handleChange"
    @clear="handleClear"
    @focus="handleFocus"
    @input="handleInput"
  >
    <!-- 前置内容插槽 -->
    <template v-if="$slots.prepend" #prepend>
      <slot name="prepend"></slot>
    </template>

    <!-- 后置内容插槽 -->
    <template v-if="$slots.append" #append>
      <slot name="append"></slot>
    </template>

    <!-- 前缀图标插槽 -->
    <template v-if="$slots.prefix" #prefix>
      <slot name="prefix"></slot>
    </template>

    <!-- 后缀图标插槽 -->
    <template v-if="$slots.suffix" #suffix>
      <slot name="suffix"></slot>
    </template>
  </el-input>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

interface Props {
  // 输入框的值
  modelValue?: string
  // 占位符
  placeholder?: string
  // 是否可清空
  clearable?: boolean
  // 是否禁用
  disabled?: boolean
  // 是否显示字数统计
  showWordLimit?: boolean
  // 最大输入长度
  maxlength?: number
  // 自定义样式
  style?: object
  // 尺寸
  size?: string
  // 自定义类名
  className?: string
  // 输入框类型
  type?: 'text' | 'textarea' | 'password'
  // 是否自动调整文本域高度
  autosize?: boolean | object
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '搜索关键字',
  clearable: true,
  disabled: false,
  showWordLimit: false,
  maxlength: undefined,
  style: () => ({}),
  className: '',
  type: 'text',
  autosize: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  input: [value: string]
  change: [value: string]
  clear: []
  blur: [event: Event]
  focus: [event: Event]
}>()

// 输入框的值
const inputValue = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value)
  },
})

// 处理输入事件
const handleInput = (value: string) => {
  emit('input', value)
}

// 处理change事件
const handleChange = (value: string) => {
  emit('change', value)
}

// 处理清空事件
const handleClear = () => {
  emit('clear')
}

// 处理失去焦点事件
const handleBlur = (event: Event) => {
  emit('blur', event)
}

// 处理获得焦点事件
const handleFocus = (event: Event) => {
  emit('focus', event)
}

// 暴露方法给父组件
defineExpose({
  // 聚焦输入框
  focus: () => {
    // 这里可以通过模板引用实现，如果需要的话
    console.log('focus method called')
  },
  // 失焦输入框
  blur: () => {
    console.log('blur method called')
  },
  // 清空输入框
  clear: () => {
    emit('update:modelValue', '')
    emit('clear')
  },
})
</script>
