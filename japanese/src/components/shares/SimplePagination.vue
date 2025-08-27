<template>
  <div class="simple-pagination">
    <el-pagination
      v-model:current-page="internalPageIndex"
      :page-size="internalPageSize"
      :total="totalItems"
      :layout="layout"
      :small="small"
      :background="background"
      :disabled="disabled"
      :hide-on-single-page="hideOnSinglePage"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'

interface Props {
  // 待分页的完整数据
  data: any[]
  // 每页条数
  pageSize?: number
  // 布局
  layout?: string
  // 是否小型
  small?: boolean
  // 是否有背景色
  background?: boolean
  // 是否禁用
  disabled?: boolean
  // 只有一页时是否隐藏
  hideOnSinglePage?: boolean
  // 是否显示每页条数选择器
  showSizeChanger?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  pageSize: 20,
  layout: 'prev, pager, next, total',
  small: true,
  background: true,
  disabled: false,
  hideOnSinglePage: false,
  showSizeChanger: false,
})

const emit = defineEmits<{
  pageChange: [pageData: any[], pageIndex: number, pageSize: number]
  'update:data': [data: any[]]
}>()

// 内部维护的状态
const internalPageIndex = ref(1)
const internalPageSize = ref(props.pageSize)

// 计算属性
const totalItems = computed(() => props.data.length)
const totalPages = computed(() =>
  Math.ceil(totalItems.value / internalPageSize.value)
)

// 计算当前页数据
const currentPageData = computed(() => {
  if (props.data.length === 0) return []

  const startIndex = (internalPageIndex.value - 1) * internalPageSize.value
  const endIndex = startIndex + internalPageSize.value

  return props.data.slice(startIndex, endIndex)
})

// 监听数据变化，重置到第一页
watch(
  () => props.data,
  () => {
    internalPageIndex.value = 1
    emitPageData()
  },
  { deep: true }
)

// 监听每页条数变化
watch(
  () => props.pageSize,
  (newSize) => {
    internalPageSize.value = newSize
    internalPageIndex.value = 1
    emitPageData()
  }
)

// 初始化布局
const layout = computed(() => {
  let baseLayout = props.layout
  if (props.showSizeChanger && !baseLayout.includes('sizes')) {
    baseLayout = 'sizes, ' + baseLayout
  }
  if (!baseLayout.includes('total') && props.showSizeChanger) {
    baseLayout += ', total'
  }
  return baseLayout
})

// 发送当前页数据给父组件
const emitPageData = () => {
  console.log(
    'emitPageData',
    currentPageData.value,
    internalPageIndex.value,
    internalPageSize.value
  )
  emit(
    'pageChange',
    currentPageData.value,
    internalPageIndex.value,
    internalPageSize.value
  )
}

// 处理页码变化
const handlePageChange = (page: number) => {
  internalPageIndex.value = page
  emitPageData()
}

// 处理每页条数变化
const handleSizeChange = (size: number) => {
  internalPageSize.value = size
  internalPageIndex.value = 1
  emitPageData()
}

// 组件挂载后发送初始数据
onMounted(() => {
  if (props.data.length > 0) {
    emitPageData()
  }
})

// 暴露方法给父组件
defineExpose({
  // 获取当前页码
  getCurrentPage: () => internalPageIndex.value,
  // 获取每页条数
  getPageSize: () => internalPageSize.value,
  // 获取总页数
  getTotalPages: () => totalPages.value,
  // 获取总条数
  getTotalItems: () => totalItems.value,
  // 获取当前页数据
  getCurrentPageData: () => currentPageData.value,
  // 跳转到指定页码
  gotoPage: (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
      internalPageIndex.value = page
      emitPageData()
    }
  },
  // 跳转到第一页
  gotoFirst: () => {
    internalPageIndex.value = 1
    emitPageData()
  },
  // 跳转到最后一页
  gotoLast: () => {
    internalPageIndex.value = totalPages.value
    emitPageData()
  },
  // 跳转到上一页
  gotoPrev: () => {
    if (internalPageIndex.value > 1) {
      internalPageIndex.value--
      emitPageData()
    }
  },
  // 跳转到下一页
  gotoNext: () => {
    if (internalPageIndex.value < totalPages.value) {
      internalPageIndex.value++
      emitPageData()
    }
  },
  // 刷新当前页数据
  refresh: () => {
    emitPageData()
  },
})
</script>

<style scoped>
.simple-pagination {
  width: 100%;
  overflow-y: scroll;
  overflow-x: hidden;
  height: var(--pagination-height);
  display: flex;
  align-items: center;
}

.el-pagination {
  margin: 0 auto;
  width: var(--content-max-width);
}
</style>
