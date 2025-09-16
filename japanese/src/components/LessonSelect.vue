<template>
  <el-select
    class="lesson-select"

    v-model="selectedValue"
    placeholder="选课程"
    :clearable="clearable"
    :fit-input-width="fitInputWidth"
    :style="style"
    :class="className"
    :lite="lite"
  >
    <template #label="{ label, value }" v-if="!lite">
      <div class="option-item">
        <div class="option-prefix" :class="levelClass(value).en">
          {{ levelClass(value).cn }}
        </div>
        <div class="option-content">{{ label }}</div>
      </div>
    </template>
    <el-option
      v-for="item in lessons"
      :key="item.index"
      :label="getOptionLabel(item)"
      :value="getOptionValue(item)"
      class="option-item"
    >
      <div
        class="option-prefix"
        :class="levelClass(item.index).en"
        v-if="!lite"
      >
        {{ levelClass(item.index).cn }}
      </div>
      <div class="option-content">{{ getOptionLabel(item) }}</div>
    </el-option>
  </el-select>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLessonStore } from '../stores/lessonStore.ts'
import { displayText } from '@/utils/lesson.ts'

interface Lesson {
  index: number
  title: string

  // 其他可能的字段
  [key: string]: any
}

interface Props {
  // 选中的值
  modelValue?: number | string | null
  // 自定义占位符
  placeholder?: string
  // 是否可清空
  clearable?: boolean
  // 自定义样式
  style?: object
  // 自定义类名
  className?: string
  // 是否显示索引前缀
  showIndex?: boolean
  // 简洁模式
  lite?: boolean
  // 输入框宽度自适应内容
  fitInputWidth?: boolean
  // 自定义标签格式化函数
  formatLabel?: (lesson: Lesson) => string
  // 自定义值获取函数
  getValue?: (lesson: Lesson) => number | string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  placeholder: '选课程',
  clearable: true,
  style: () => ({}),
  className: '',
  showIndex: true,
  fitInputWidth: false,
  lite: false,
  formatLabel: undefined,
  getValue: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: number | string | null]
  change: [value: number | string | null, lesson: Lesson | null]
}>()

const lessonStore = useLessonStore()

// 计算属性获取课程列表
const lessons = computed(() => lessonStore.lessons || [])

// 选中的值
const selectedValue = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value)
    const selectedLesson =
      lessons.value.find((lesson) =>
        props.getValue
          ? props.getValue(lesson) === value
          : lesson.index === value
      ) || null
    emit('change', value, selectedLesson)
  },
})

// 获取选项标签
const getOptionLabel = (lesson: Lesson) => {
  if (props.formatLabel) {
    return props.formatLabel(lesson)
  }
  const title = lesson.title
  return displayText(title)
}

// 获取选项值
const getOptionValue = (lesson: Lesson) => {
  if (props.getValue) {
    return props.getValue(lesson)
  }
  return lesson.index
}

const levelClass = (index: number) => {
  if (index < 200) {
    return { en: 'level-junior', cn: '初级' }
  } else if (index < 300) {
    return { en: 'level-medium', cn: '中级' }
  } else if (index < 400) {
    return { en: 'level-senior', cn: '高级' }
  }
  return { en: '', cn: '' }
}

// 暴露方法给父组件
defineExpose({
  // 获取当前选中的课程对象
  getSelectedLesson: () => {
    return (
      lessons.value.find((lesson) =>
        props.getValue
          ? props.getValue(lesson) === props.modelValue
          : lesson.index === props.modelValue
      ) || null
    )
  },
  // 刷新课程列表（如果需要的话）
  refreshLessons: () => {
    // 这里可以添加刷新逻辑，比如重新调用接口
    console.log('刷新课程列表')
  },
})
</script>

<style scoped>
.option-item {
  display: flex;
  align-items: center;
  overflow-x: hidden;
  gap: var(--gap12);
  height: 100%;
}

.option-prefix {
  display: flex;
  align-items: center;
  height: 20px;
  font-size: 12px;
  padding: 0 5px;
  border-radius: 5px;
}

.level-junior {
  color: var(--el-color-success);
  border: 1px solid var(--el-color-success);
}

.level-medium {
  color: var(--el-color-warning);
  border: 1px solid var(--el-color-warning);
}

.level-senior {
  color: var(--el-color-error);
  border: 1px solid var(--el-color-error);
}

.option-content {
  flex: 1;
  text-align: left;
  overflow-x: hidden;
  text-wrap: nowrap;
  text-overflow: ellipsis;
}
</style>
