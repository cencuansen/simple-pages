<template>
  <div class="vocabulary-list">
    <el-input
        class="vocabulary-input"
        v-model.lazy="searchInput"
        placeholder="搜索词汇、读音、释义或标签"
        clearable
        size="small"
    />
    <el-table
        :data="store.paginatedVocabularies"
        v-loading="store.loading"
        :show-header="false"
        stripe
    >
      <el-table-column label="词汇">
        <template #default="scope">
          <div :id="`word-${scope.row.expression}`" class="column-word">{{ scope.row.expression }}
          </div>
          <div :id="`word-${scope.row.reading}`" class="column-kana">{{ scope.row.reading }}
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="meaning" label="释义"/>
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
              @click="speechStore.speak(scope.row.reading)">
            <el-icon>
              <i class="icon-on-MPIS-TTS"></i>
            </el-icon>
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
        v-model:current-page="store.currentPage"
        :page-size="store.pageSize"
        :total="store.filteredVocabularies.length"
        layout="prev, pager, next"
        @current-change="store.setPage"
    />
    <div v-if="store.error" class="error">{{ store.error }}</div>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted} from 'vue';
import {useSpeechStore} from "../stores/speechStore";
import {useVocabularyStore} from '../stores/vocabularyStore.ts';
import {useBaseSettingStore} from "../stores/baseSettingStore";
import {ElTable, ElTableColumn, ElPagination, ElInput} from 'element-plus';

const store = useVocabularyStore();
const speechStore = useSpeechStore();
const baseSettingStore = useBaseSettingStore();

// 初始化加载数据
onMounted(() => {
  store.loadVocabularies();
});

// 搜索输入
const searchInput = computed({
  get: () => store.searchQuery,
  set: (value) => store.setSearchQuery(value),
});
</script>

<style scoped>
.vocabulary-input {
  margin-bottom: 10px;
  width: 100%;
}

.vocabulary-list {
  margin: 0 auto;
  padding: 0;
  max-width: var(--content-max-width);
}

.el-table {
  height: calc(100vh - 230px);
}

.el-pagination {
  margin-top: 10px;
}

.error {
  color: red;
  margin-top: 10px;
}
</style>
