<template>
  <div class="verb-conju">
    <Row>
      <SimpleInput v-model.trim="keyword" />
      <SimpleSelect
        multiple
        :data="columns"
        v-model="selectedCols"
        placeholder="选择列"
      />
    </Row>

    <div class="verb-conju-main">
      <el-table
        class="el-table"
        :data="afterPage"
        fit
        empty-text="暂无数据"
        stripe
        style="width: 100%"
      >
        <template v-for="col in columns">
          <el-table-column
            v-if="selectedCols.includes(col.value)"
            :prop="col.value"
            :label="col.label"
            :formatter="col.formatter"
          ></el-table-column>
        </template>
      </el-table>
    </div>
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
  return list
})

// 当前页数据
const afterPage = ref<Conju[]>([])
const pageChange = (data: Conju[]) => {
  afterPage.value = data
}

const emptyFn = (_1: any, _2: any, cellValue: any, _3: number) => cellValue

const typeFn = (_1: any, _2: any, cellValue: any, _3: number) => {
  if (!cellValue) {
    return null
  } else if (cellValue === 'godan') {
    return '五段动词'
  } else if (cellValue === 'ichidan') {
    return '一段动词'
  } else if (cellValue === 'irregular') {
    return '不规则动词'
  } else {
    return null
  }
}

const transitivityFn = (_1: any, _2: any, cellValue: any, _3: number) => {
  if (!cellValue) {
    return null
  } else if (cellValue === 't') {
    return '他动词'
  } else if (cellValue === 'i') {
    return '自动词'
  } else if (cellValue.includes('t') && cellValue.includes('i')) {
    return '自他动词'
  } else {
    return null
  }
}

const columns = ref([
  {
    value: 'dictionary',
    label: '辞书',
    formatter: emptyFn,
    show: true,
  },
  {
    value: 'hiragana',
    label: '平假名',
    formatter: emptyFn,
    show: true,
  },
  {
    value: 'meaning',
    label: '释义',
    formatter: emptyFn,
    show: true,
  },
  {
    value: 'type',
    label: '类型',
    formatter: typeFn,
    show: false,
  },
  {
    value: 'transitivity',
    label: '及物性',
    formatter: transitivityFn,
    show: false,
  },
  {
    value: 'negative',
    label: '否定',
    formatter: emptyFn,
    show: true,
  },
  {
    value: 'polite',
    label: '丁宁',
    formatter: emptyFn,
    show: true,
  },
  {
    value: 'conditional',
    label: '条件',
    formatter: emptyFn,
    show: true,
  },
  {
    value: 'volitional',
    label: '意向',
    formatter: emptyFn,
    show: true,
  },
  {
    value: 'te',
    label: 'て',
    formatter: emptyFn,
    show: true,
  },
  {
    value: 'past',
    label: '过去',
    formatter: emptyFn,
    show: true,
  },
  {
    value: 'negativePast',
    label: '过去否定',
    formatter: emptyFn,
    show: true,
  },
  {
    value: 'passive',
    label: '被动',
    formatter: emptyFn,
    show: true,
  },
  {
    value: 'causative',
    label: '使役',
    formatter: emptyFn,
    show: true,
  },
  {
    value: 'potential',
    label: '可能',
    formatter: emptyFn,
    show: true,
  },
  {
    value: 'imperative',
    label: '命令',
    formatter: emptyFn,
    show: true,
  },
])

const selectedCols = ref<string[]>([])

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
