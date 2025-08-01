<template>
  <div class="verb-conju">
    <div class="verb-conju-header">
      <el-input v-model="keyword" size="small" placeholder="搜索" clearable></el-input>
      <el-select v-model="selectedCols" size="small" style="width: 210px;" placeholder="选择列" multiple collapse-tags fit-input-width>
        <el-option v-for="col in columns" :key="col.label" :value="col.label" :label="col.label"></el-option>
      </el-select>
    </div>
    <el-table class="el-table" :data="conjuView" stripe fit style="width: 100%">
      <template v-for="col in columns">
        <el-table-column v-if="selectedCols.includes(col.label)"
                         :prop="col.prop" :label="col.label"
                         :formatter="col.formatter"
        ></el-table-column>
      </template>

    </el-table>
    <div class="verb-conju-footer">
      <el-pagination
          v-model:current-page="pageIndex"
          :page-size="pageSize"
          :total="conjuVerbs.length"
          layout="prev, pager, next"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {useConjuStore, type Conju} from "../stores/conjuStore.ts"
import {storeToRefs} from "pinia";
import {computed, onMounted, ref} from "vue";
import {ElPagination} from "element-plus";

const verbConjuStore = useConjuStore()
const {conjuVerbs} = storeToRefs(verbConjuStore)

const keyword = ref<string>()
const pageSize = 18;
const pageIndex = ref(1)
const conjuView = computed(() => {
  let list = conjuVerbs.value as Conju[]
  if (keyword.value) {
    list = list.filter(item => Object.values(item).join(' ').includes(keyword.value || ""))
  }
  const start = (pageIndex.value - 1) * pageSize
  const end = start + pageSize
  return list.slice(start, end)
})

const emptyFn = (_1: any, _2: any, cellValue: any, _3: number) => cellValue

const typeFn = (_1: any, _2: any, cellValue: any, _3: number) => {
  if (!cellValue) {
    return null
  } else if (cellValue === 'godan') {
    return "5段动词"
  } else if (cellValue === 'ichidan') {
    return "1段动词"
  } else if (cellValue === 'irregular') {
    return "不规则动词"
  } else {
    return null
  }
}

const transitivityFn = (_1: any, _2: any, cellValue: any, _3: number) => {
  if (!cellValue) {
    return null
  } else if (cellValue === 't') {
    return "他动词"
  } else if (cellValue === 'i') {
    return "自动词"
  } else if (cellValue.includes('t') && cellValue.includes('i')) {
    return "自他动词"
  } else {
    return null
  }
}

const columns = ref([
  {
    prop: "dictionary", label: "辞书", formatter: emptyFn, show: true
  },
  {
    prop: "hiragana", label: "平假名", formatter: emptyFn, show: true
  },
  {
    prop: "meaning", label: "释义", formatter: emptyFn, show: true
  },
  {
    prop: "type", label: "类型", formatter: typeFn, show: false
  },
  {
    prop: "transitivity", label: "及物性", formatter: transitivityFn, show: false
  },
  {
    prop: "negative", label: "否定", formatter: emptyFn, show: true
  },
  {
    prop: "polite", label: "丁寧", formatter: emptyFn, show: true
  },
  {
    prop: "conditional", label: "条件", formatter: emptyFn, show: true
  },
  {
    prop: "volitional", label: "意向", formatter: emptyFn, show: true
  },
  {
    prop: "te", label: "て", formatter: emptyFn, show: true
  },
  {
    prop: "past", label: "過去", formatter: emptyFn, show: true
  },
  {
    prop: "negativePast", label: "過去否定", formatter: emptyFn, show: true
  },
  {
    prop: "passive", label: "被动", formatter: emptyFn, show: true
  },
  {
    prop: "causative", label: "使役", formatter: emptyFn, show: true
  },
  {
    prop: "potential", label: "可能", formatter: emptyFn, show: true
  },
  {
    prop: "imperative", label: "命令", formatter: emptyFn, show: true
  },
])

const selectedCols = ref<string[]>([])

onMounted(() => {
  selectedCols.value = columns.value.filter(col => col.show).map(col => col.label)
})
</script>

<style scoped>
.verb-conju {
  height: calc(100vh - 41px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
}

.verb-conju-header {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-around;
  padding: 0 5px;
}

.el-table {
  height: calc(100vh - 120px);
}

.verb-conju-footer {
  height: 150px;
}
</style>