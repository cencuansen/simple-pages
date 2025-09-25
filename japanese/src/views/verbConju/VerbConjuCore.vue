<template>
  <div class="verb-conju">
    <Row>
      <SimpleSelect
        multiple
        :data="lessonIndexOptions"
        v-model="selectedLessons"
        placeholder="选择课程"
        v-if="lessonSelect"
      />
      <SimpleSelect
        multiple
        :data="typeOptions"
        v-model="selectedTypes"
        placeholder="选择类型"
        v-if="typeSelect"
      />
      <SimpleSelect
        multiple
        :data="transitivityOptions"
        v-model="selectedTransitivities"
        placeholder="选择及物性"
        v-if="transitivitySelect"
      />
      <SimpleInput v-model.trim="keyword" v-if="keywordFilter" />
    </Row>

    <div class="verb-conju-main">
      <el-table :data="afterPage" empty-text="暂无数据" stripe>
        <el-table-column label="" width="60" fixed="left">
          <template #default="scope">
            <el-text
              class="detail-button"
              @click="rowClick(scope.row)"
            >
              详情
            </el-text>
          </template>
        </el-table-column>
        <template v-for="col in columns">
          <el-table-column
            :prop="col.value"
            :label="col.label"
            :formatter="col.formatter"
            show-overflow-tooltip
          ></el-table-column>
        </template>
      </el-table>
    </div>

    <el-dialog
      class="conju-detail"
      :modal="true"
      v-model="dialogModel"
      width="400"
      fullscreen
      center
    >
      <div class="dialog-main">
        <div class="detail-left">
          <el-form label-width="auto" :label-position="'right'">
            <el-form-item v-for="col in columns" :label="col.label">
              <span>
                {{
                  currentRow &&
                  col.formatter &&
                  col.formatter(null, null, currentRow[col.value], 0)
                }}
              </span>
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
      </div>
    </el-dialog>

    <SimplePagination
      :data="beforePage"
      :page-size="pageSize"
      @page-change="pageChange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import SimpleSelect from '../../components/SimpleSelect.vue'
import Row from '../../components/Row.vue'
import SimpleInput from '../../components/SimpleInput.vue'
import SimplePagination from '../../components/SimplePagination.vue'
import { ElTable } from 'element-plus'
import { transitivityOptions, typeOptions } from '../../constants/verbConju.ts'
import type { Conju, VerbConjuColumn } from '@/types/verbConju.ts'
import Dictionary from '../../components/Dictionary/DictionarySelector.vue'

interface VerbConjuProps {
  data: Conju[]
  pageSize?: number
  lessonSelect?: boolean
  typeSelect?: boolean
  transitivitySelect?: boolean
  keywordFilter?: boolean
  columns: VerbConjuColumn[]
}

const props = defineProps<VerbConjuProps>()

const keyword = ref<string>('')

const beforePage = computed(() => {
  let list: Conju[] = props.data
  if (selectedLessons.value.length) {
    list = list.filter((item) => selectedLessons.value.includes(item.lesson))
  }
  if (selectedTypes.value.length) {
    list = list.filter((item) => selectedTypes.value.includes(item.type))
  }
  if (selectedTransitivities.value.length) {
    list = list.filter((item) =>
      selectedTransitivities.value.some((st) => item.transitivity.includes(st))
    )
  }
  if (keyword.value) {
    list = list.filter((item) =>
      Object.values(item).join('_').includes(keyword.value)
    )
  }
  return list
})

// 当前页数据
const afterPage = ref<Conju[]>([])
const pageChange = (data: Conju[]) => {
  afterPage.value = data
}

const lessonIndexOptions = computed(() => {
  return [...new Set(props.data.map((item) => item.lesson))].sort()
})

const selectedLessons = ref<number[]>([])
const selectedTypes = ref<string[]>([])
const selectedTransitivities = ref<string[]>([])

const dialogModel = ref(false)
const currentRow = ref<Conju>()
const rowClick = (row: Conju) => {
  dialogModel.value = true
  currentRow.value = row
}

const mainHeight = `calc(100vh - var(--root-header-height) - var(--single-row-header-height) - var(--pagination-height) - var(--root-footer-height))`
</script>

<style scoped>
.verb-conju {
  width: 100%;
  height: 100%;
}

.verb-conju-main {
  overflow-y: scroll;
  height: v-bind(mainHeight);
}

:deep(.el-table .el-scrollbar__wrap) {
  /* 解决移动端滚动不顺畅问题 */
  overflow-y: hidden;
}

.dialog-main {
  margin: 0 auto;
  width: 100%;
  max-width: 350px;
  display: flex;
  gap: var(--gap12);
  border-radius: 5px;
  padding: 15px;
  background-color: var(--el-bg-color-overlay);
}

.el-form-item {
  margin-bottom: 0;
}

.detail-button {
  cursor: pointer;
  color: var(--el-color-primary);
}

.detail-left {
  flex: 2 0 auto;
}

.detail-right {
  flex: 1 1 auto;
}
</style>
