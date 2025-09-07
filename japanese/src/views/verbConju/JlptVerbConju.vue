<template>
  <div class="verb-conju">
    <Row>
      <SimpleSelect
        multiple
        :data="allTypes"
        v-model="selectedTypes"
        placeholder="选择类型"
      />
      <SimpleSelect
        multiple
        :data="allTrans"
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
      >
        <el-table-column label="" width="50" fixed="left">
          <template #default="scope">
            <el-text
              style="cursor: pointer"
              size="small"
              type="primary"
              @click="rowClick(scope.row)"
            >
              详情
            </el-text>
          </template>
        </el-table-column>
        <template v-for="col in columns">
          <el-table-column
            v-if="selectedCols.includes(col.value)"
            :prop="col.value"
            :label="col.label"
            :formatter="col.formatter"
            :width="col.width"
            show-overflow-tooltip
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
      <div class="detail-left">
        <el-form label-width="auto" :label-position="'right'">
          <el-form-item v-for="col in columns" :label="col.label">
            <span>{{
              currentRow && col.formatter(null, null, currentRow[col.value], 0)
            }}</span>
          </el-form-item>
        </el-form>
      </div>
      <div class="detail-right">
        <el-form>
          <el-form-item :label="' '">
            <Dictionary :word="currentRow && currentRow['dictionary']" />
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>

    <SimplePagination :data="beforePage" @page-change="pageChange" />
  </div>
</template>

<script setup lang="ts">
import { useJlptConjuStore } from '../../stores/jlptConjuStore.ts'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'
import SimpleSelect from '../../components/SimpleSelect.vue'
import Row from '../../components/Row.vue'
import SimpleInput from '../../components/SimpleInput.vue'
import SimplePagination from '../../components/SimplePagination.vue'
import { ElTable } from 'element-plus'
import { columns, type Conju } from './index.ts'
import Dictionary from '../../components/Dictionary/Dictionary.vue'

const jlptVerbConjuStore = useJlptConjuStore()
const { jlptConjuVerbs, allTypes, allTrans } = storeToRefs(jlptVerbConjuStore)

const keyword = ref<string>()

const beforePage = computed(() => {
  let list = jlptConjuVerbs.value as Conju[]
  if (keyword.value) {
    list = list.filter((item) =>
      Object.values(item)
        .join(' ')
        .includes(keyword.value || '')
    )
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

const selectedCols = ref<string[]>([])
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

const mainHeight = `calc(100vh - var(--root-header-height) - var(--single-row-header-height) - var(--pagination-height) - var(--root-footer-height))`
</script>

<style scoped>
.verb-conju {
  position: fixed;
  width: 100%;
  height: 100%;
}

.verb-conju-main {
  overflow-y: scroll;
  height: v-bind(mainHeight);
}

:deep(.el-scrollbar__wrap) {
  /* 解决移动端滚动不顺畅问题 */
  overflow-y: hidden;
}

:deep(.el-dialog__body) {
  display: flex;
  gap: var(--gap12);
}

.detail-left,
.detail-right {
  height: 100%;
}

:deep(.el-overlay) {
  background-color: rgba(0, 0, 0, 0.9);
}
</style>
