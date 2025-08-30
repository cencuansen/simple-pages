<template>
  <div class="verb-conju">
    <Row>
      <!--      <SimpleSelect-->
      <!--        multiple-->
      <!--        :data="columns"-->
      <!--        v-model="selectedCols"-->
      <!--        placeholder="选择列"-->
      <!--      />-->
      <SimpleSelect
        multiple
        :data="lessonIndexOptions"
        v-model="selectedLessons"
        placeholder="选择课程"
      />
      <SimpleSelect
        multiple
        :data="typeOptions"
        v-model="selectedTypes"
        placeholder="选择类型"
      />
      <SimpleSelect
        multiple
        :data="transitivityOptions"
        v-model="selectedTransitivities"
        placeholder="选择及物性"
      />
      <SimpleInput v-model.trim="keyword" />
    </Row>

    <div class="verb-conju-main">
      <el-table
        class="el-table"
        :data="afterPage"
        fit
        empty-text="暂无数据"
        stripe
        style="width: 100%"
        @row-click="rowClick"
      >
        <template v-for="col in columns">
          <el-table-column
            v-if="selectedCols.includes(col.value)"
            :prop="col.value"
            :label="col.label"
            :formatter="col.formatter"
            :width="col.width"
          ></el-table-column>
        </template>
      </el-table>
    </div>

    <el-dialog
      class="conju-detail"
      :modal="true"
      v-model="dialogModel"
      center
      align-center
      width="400"
    >
      <el-form label-width="auto" :label-position="'right'">
        <el-form-item v-for="col in columns" :label="col.label">
          <span>{{
            currentRow && col.formatter(null, null, currentRow[col.value], 0)
          }}</span>
        </el-form-item>
      </el-form>
    </el-dialog>

    <SimplePagination :data="beforePage" @page-change="pageChange" />
  </div>
</template>

<script setup lang="ts">
import { useConjuStore, type Conju } from '../stores/conjuStore.ts'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'
import SimpleSelect from './shares/SimpleSelect.vue'
import Row from './shares/Row.vue'
import SimpleInput from './shares/SimpleInput.vue'
import SimplePagination from './shares/SimplePagination.vue'
import { ElTable } from 'element-plus'

const verbConjuStore = useConjuStore()
const { conjuVerbs } = storeToRefs(verbConjuStore)

const keyword = ref<string>()

const beforePage = computed(() => {
  let list = conjuVerbs.value as Conju[]
  if (keyword.value) {
    list = list.filter((item) =>
      Object.values(item)
        .join(' ')
        .includes(keyword.value || '')
    )
  }
  if (selectedLessons.value.length > 0) {
    list = list.filter((item) => selectedLessons.value.includes(item.lesson))
  }
  if (selectedTypes.value.length > 0) {
    list = list.filter((item) => selectedTypes.value.includes(item.type))
  }
  if (selectedTransitivities.value.length > 0) {
    list = list.filter((item) =>
      selectedTransitivities.value.some((st) => item.transitivity.includes(st))
    )
  }
  return list
})

// 当前页数据
const afterPage = ref<Conju[]>([])
const pageChange = (data: Conju[]) => {
  afterPage.value = data
}

const emptyFn = (_1: any, _2: any, cellValue: any, _3: number) => cellValue

const lessonIndexOptions = computed(() => {
  return [...new Set(conjuVerbs.value.map((item) => item.lesson))].sort()
})

const typeOptions = ['五段动词', '一段动词', '不规则动词']
const transitivityOptions = ['他动词', '自动词', '自他动词']

const columns = ref([
  {
    value: 'dictionary',
    label: '辞书',
    formatter: emptyFn,
    show: true,
    width: 180,
  },
  {
    value: 'hiragana',
    label: '平假名',
    formatter: emptyFn,
    show: true,
    width: 180,
  },
  {
    value: 'meaning',
    label: '释义',
    formatter: emptyFn,
    show: true,
    width: 180,
  },
  {
    value: 'type',
    label: '类型',
    formatter: emptyFn,
    show: true,
    width: 180,
  },
  {
    value: 'transitivity',
    label: '及物性',
    formatter: emptyFn,
    show: true,
    width: 180,
  },
  {
    value: 'te',
    label: 'て',
    formatter: emptyFn,
    show: true,
    width: 180,
  },
  {
    value: 'past',
    label: '过去',
    formatter: emptyFn,
    show: true,
    width: 180,
  },
  {
    value: 'negative',
    label: '否定',
    formatter: emptyFn,
    show: true,
    width: 180,
  },
  {
    value: 'negativePast',
    label: '过去否定',
    formatter: emptyFn,
    show: true,
    width: 180,
  },
  {
    value: 'polite',
    label: '丁宁',
    formatter: emptyFn,
    show: true,
    width: 180,
  },
  {
    value: 'potential',
    label: '可能',
    formatter: emptyFn,
    show: true,
    width: 180,
  },
  {
    value: 'passive',
    label: '被动',
    formatter: emptyFn,
    show: true,
    width: 180,
  },
  {
    value: 'causative',
    label: '使役',
    formatter: emptyFn,
    show: true,
    width: 180,
  },
  {
    value: 'causativePassive',
    label: '使役被动',
    formatter: emptyFn,
    show: false,
    width: 180,
  },
  {
    value: 'conditional',
    label: '条件',
    formatter: emptyFn,
    show: true,
    width: 180,
  },
  {
    value: 'imperative',
    label: '命令',
    formatter: emptyFn,
    show: true,
    width: 180,
  },
  {
    value: 'volitional',
    label: '意向',
    formatter: emptyFn,
    show: true,
    width: 180,
  },
  {
    value: 'prohibitive',
    label: '禁止',
    formatter: emptyFn,
    show: false,
    width: 180,
  },
  {
    value: 'lesson',
    label: '课程',
    formatter: emptyFn,
    show: true,
    width: 60,
  },
])

const selectedCols = ref<string[]>([])
const selectedLessons = ref<number[]>([])
const selectedTypes = ref<string[]>([])
const selectedTransitivities = ref<string[]>([])

const dialogModel = ref(false)
const currentRow = ref<Conju>()
const rowClick = (row: Conju) => {
  dialogModel.value = true
  currentRow.value = row
}

onMounted(() => {
  selectedCols.value = columns.value
    .filter((col) => col.show)
    .map((col) => col.value)
})
</script>

<style scoped>
.verb-conju {
  position: fixed;
  width: 100%;
  height: 100%;
}

.verb-conju-main {
  overflow-y: scroll;
  height: calc(
    100vh - var(--root-header-height) - var(--single-row-header-height) -
      var(--pagination-height) - var(--root-footer-height)
  );
}

:deep(.el-scrollbar__wrap) {
  /* 解决移动端滚动不顺畅问题 */
  overflow-y: hidden;
}

:deep(.el-overlay) {
  background-color: rgba(0, 0, 0, 0.9);
}

.el-form-item {
  margin-bottom: 0;
}

.verb-conju-pagination {
  width: 100%;
  overflow-x: hidden;
  overflow-y: scroll;
  height: var(--pagination-height);
}

.el-pagination {
  margin: 0 auto;
  max-width: 100%;
}
</style>
