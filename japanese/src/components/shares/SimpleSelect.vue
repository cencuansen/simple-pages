<template>
  <el-select
    class="simple-select"
    :size="size"
    v-model="selectedValue"
    :placeholder="placeholder"
    :clearable="clearable"
    :multiple="multiple"
    :collapse-tags="collapseTags"
    :collapse-tags-tooltip="collapseTagsTooltip"
    fit-input-width
    :style="style"
    :class="className"
    :disabled="disabled"
    :filterable="filterable"
    @change="handleChange"
  >
    <el-option
      class="simple-select-option"
      v-for="(item, index) in options"
      :key="getKey(item, index)"
      :label="getLabel(item)"
      :value="getValue(item)"
      :disabled="isDisabled(item)"
    />
  </el-select>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface SelectOption {
  value?: any
  label?: string
  disabled?: boolean

  [key: string]: any
}

interface Props {
  // 选中的值
  modelValue?: any
  // 选项数据
  data?: SelectOption[] | any[]
  // 占位符
  placeholder?: string
  // 是否可清空
  clearable?: boolean
  // 是否多选
  multiple?: boolean
  // 多选时是否折叠标签
  collapseTags?: boolean
  // 折叠标签时是否显示提示
  collapseTagsTooltip?: boolean
  // 自定义样式
  style?: object
  // 尺寸
  size?: string
  // 自定义类名
  className?: string
  // 是否禁用
  disabled?: boolean
  // 是否可搜索
  filterable?: boolean
  // 值字段名（当data为对象数组时）
  valueKey?: string
  // 标签字段名（当data为对象数组时）
  labelKey?: string
  // 禁用字段名（当data为对象数组时）
  disabledKey?: string
  // 自定义标签格式化函数
  formatLabel?: (item: any) => string
  // 自定义值获取函数
  formatValue?: (item: any) => any
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  data: () => [],
  placeholder: '请选择',
  clearable: true,
  multiple: false,
  collapseTags: true,
  collapseTagsTooltip: false,
  style: () => ({}),
  size: 'small',
  className: '',
  disabled: false,
  filterable: false,
  valueKey: 'value',
  labelKey: 'label',
  disabledKey: 'disabled',
  formatLabel: undefined,
  formatValue: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: any]
  change: [value: any, item: any | any[]]
}>()

// 处理选项数据
const options = computed(() => {
  if (!props.data || props.data.length === 0) return []
  return props.data
})

// 选中的值
const selectedValue = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value)
  },
})

// 获取选项的唯一key
const getKey = (item: any, index: number) => {
  if (typeof item === 'object' && item !== null) {
    return item[props.valueKey] || index
  }
  return item || index
}

// 获取选项的显示标签
const getLabel = (item: any): string => {
  if (props.formatLabel) {
    return props.formatLabel(item)
  }

  if (typeof item === 'object' && item !== null) {
    return item[props.labelKey] || String(item[props.valueKey] || '')
  }
  return String(item)
}

// 获取选项的值
const getValue = (item: any): any => {
  if (props.formatValue) {
    return props.formatValue(item)
  }

  if (typeof item === 'object' && item !== null) {
    return item[props.valueKey]
  }
  return item
}

// 判断选项是否禁用
const isDisabled = (item: any): boolean => {
  if (typeof item === 'object' && item !== null) {
    return item[props.disabledKey] || false
  }
  return false
}

// 处理change事件
const handleChange = (value: any) => {
  let selectedItems: any = null

  if (props.multiple && Array.isArray(value)) {
    selectedItems = options.value.filter((option) =>
      value.includes(getValue(option))
    )
  } else {
    selectedItems =
      options.value.find((option) => getValue(option) === value) || null
  }

  emit('change', value, selectedItems)
}

// 暴露方法给父组件
defineExpose({
  // 获取当前选中的选项
  getSelectedItems: () => {
    if (props.multiple && Array.isArray(props.modelValue)) {
      return options.value.filter((option) =>
        props.modelValue.includes(getValue(option))
      )
    } else {
      return (
        options.value.find((option) => getValue(option) === props.modelValue) ||
        null
      )
    }
  },
  // 清空选择
  clear: () => {
    emit('update:modelValue', props.multiple ? [] : null)
  },
})
</script>