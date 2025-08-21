<template>
  <div class="words">
    <div class="word-headers">
      <div class="word-header">
        <el-input
          class="search"
          v-model.trim="keyword"
          size="small"
          placeholder="搜单词"
          clearable
        ></el-input>
      </div>
    </div>

    <div class="word-main">
      <el-table
        :data="store.pageView"
        v-loading="store.loading"
        :show-header="false"
        stripe
      >
        <el-table-column label="词汇">
          <template #default="scope">
            <div :id="`word-${scope.row.expression}`" class="column-word">
              {{ scope.row.expression }}
            </div>
            <div :id="`word-${scope.row.reading}`" class="column-kana">
              {{ scope.row.reading }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="meaning" label="释义" />
        <el-table-column label="标签" width="65">
          <template #default="scope">{{ scope.row.levelName }}</template>
        </el-table-column>
        <el-table-column label="" width="50" v-if="baseSettingStore.ttsSpeak">
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

const store = useVocabularyStore()
const speechStore = useSpeechStore()
const baseSettingStore = useBaseSettingStore()

// 初始化加载数据
onMounted(() => {
  store.loadVocabularies()
})

// 搜索输入
const keyword = computed({
  get: () => store.searchQuery,
  set: (value) => store.setSearchQuery(value),
})
</script>

<style scoped>
.words {
  width: 100%;
  height: 100%;
  position: fixed;
}

.word-headers {
  overflow-y: scroll;
}

.word-header {
  height: var(--single-row-header-height);
  display: flex;
  margin: 0 auto;
  max-width: var(--content-max-width);
}

.word-header > * {
  margin-right: 10px;
}

.word-header > *:last-child {
  margin-right: 0;
}

.search {
  margin-bottom: 10px;
  width: 100%;
  max-width: var(--content-max-width);
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

.pagination {
  width: 100%;
  height: var(--pagination-height);
  overflow-y: scroll;
}

.el-pagination {
  margin: 0 auto;
  max-width: var(--content-max-width);
}
</style>
