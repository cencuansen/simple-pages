<template>
  <div class="words">
    <Row>
      <SimpleSelect
        multiple
        :data="store.levels"
        v-model="store.selectedLevels"
        placeholder="选等级"
      />
      <SimpleInput v-model.trim="keyword"/>
    </Row>

    <div class="word-main">
      <el-table
        :data="store.pageView"
        v-loading="store.loading"
        :show-header="false"
        stripe
      >
        <el-table-column label="词汇" min-width="150">
          <template #default="scope">
            <div :id="`word-${scope.row.expression}`" class="column-word">
              {{ scope.row.expression }}
            </div>
            <div :id="`word-${scope.row.reading}`" class="column-kana">
              {{ scope.row.reading }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="meaning" label="释义" min-width="150"/>
        <el-table-column label="标签" min-width="150">
          <template #default="scope">
            <div
              class="tag-item"
              v-for="item in scope.row.levels"
              :key="item"
              :title="item"
              v-html="item"
              :class="{ match: store.selectedLevels.includes(item) }"
            ></div>
          </template>
        </el-table-column>
        <el-table-column label="" width="50" v-if="baseSettingStore.ttsSpeak" fixed="right">
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              circle
              :disabled="speechStore.isSpeaking"
              @click="speechStore.speak(scope.row.reading)"
            >
              <el-icon>
                <i class="icon-on-MPIS-TTS"></i>
              </el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="pagination">
      <el-pagination
        v-model:current-page="store.currentPage"
        :page-size="store.pageSize"
        :total="store.totalInView"
        layout="prev, pager, next"
        @current-change="store.setPage"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useSpeechStore } from '../stores/speechStore'
import { useVocabularyStore } from '../stores/vocabularyStore.ts'
import { useBaseSettingStore } from '../stores/baseSettingStore'
import { ElTable, ElTableColumn, ElPagination, ElInput } from 'element-plus'
import SimpleSelect from './shares/SimpleSelect.vue'
import Row from './shares/Row.vue'
import SimpleInput from './shares/SimpleInput.vue'

const store = useVocabularyStore()
const speechStore = useSpeechStore()
const baseSettingStore = useBaseSettingStore()

// 初始化加载数据
onMounted(() => {
  store.loadVocabularies()
})

// 搜索输入
const keyword = computed({
  get: () => store.keyword,
  set: (value) => store.setKeyword(value),
})
</script>

<style scoped>
.words {
  width: 100%;
  height: 100%;
  position: fixed;
}

.word-main {
  margin: 0 auto;
  padding: 0;
  overflow-y: scroll;
  width: 100%;
  height: calc(
    100vh - var(--root-header-height) - var(--single-row-header-height) -
      var(--pagination-height) - var(--root-footer-height)
  );
}

.el-table {
  margin: 0 auto;
  max-width: var(--content-max-width);
}

.tag-item {
  width: 100%;
  overflow: hidden;
  text-wrap: nowrap;
  text-overflow: ellipsis;
}

.pagination {
  width: 100%;
  height: var(--pagination-height);
  overflow-y: scroll;
  overflow-x: hidden;
}

.el-pagination {
  margin: 0 auto;
  max-width: var(--content-max-width);
}
</style>
