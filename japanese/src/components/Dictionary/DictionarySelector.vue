<template>
  <div class="dictionary">
    <el-dropdown size="small" split-button type="default" :disabled="disabled">
      <DictionaryCore :word="word || ''" :dict="nowDict" />
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item
            class="dict-item"
            v-for="dict in dictionaries"
            @click="selectOne(dict)"
          >
            {{ `${dict.name}` }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Dictionary, DictionarySelector } from './types.ts'
import { dictionaries } from './index.ts'
import { useDictionaryStore } from '../../stores/dictionaryStore.ts'
import DictionaryCore from './DictionaryCore.vue'

const props = defineProps<DictionarySelector>()

const dictionaryStore = useDictionaryStore()

const initDict = dictionaryStore.getOne(props.dictName)
const nowDict = ref<Dictionary>(initDict)
const selectOne = (dict: Dictionary): void => {
  nowDict.value = dict
}

const emit = defineEmits<{
  (e: 'change', newDict: Dictionary): void
}>()

if (nowDict.value) {
  emit('change', nowDict.value)
}

watch(
  () => nowDict.value,
  (val: Dictionary | undefined) => {
    if (val) {
      emit('change', val)
    }
  }
)
</script>

<style scoped>
.dictionary {
  display: flex;
  gap: 1rem;
}

:deep(.el-dropdown .el-button-group button:first-child) {
  width: 24px;
}

:deep(.el-dropdown .el-button-group button:first-child span) {
  position: absolute;
  width: 100%;
  height: 100%;
}

:deep(.el-dropdown .el-button-group button:last-child) {
  position: absolute;
  width: 15px;
  height: 100%;
  outline: none;
}
</style>
