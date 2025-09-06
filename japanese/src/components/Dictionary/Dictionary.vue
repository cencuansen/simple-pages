<template>
  <div class="dictionary">
    <el-dropdown size="small" split-button type="default" :disabled="disabled">
      <a
        class="now-dict"
        target="_blank"
        :href="toUrl(props.word, nowDict)"
        :title="nowDict?.name"
      >
        <img
          class="now-dict-img"
          v-if="nowDict?.logo"
          :src="nowDict?.logo"
          :alt="nowDict?.name"
        />
        <span class="now-dict-label" v-else>{{ nowDict?.label }}</span>
      </a>
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
import type { Dictionary, DictionaryProps } from './types.ts'
import { dictionaries, getDictionary, toUrl } from './index.ts'
import { useSettingStore } from '../../stores/settingStore'

const settingStore = useSettingStore()

const props = defineProps<DictionaryProps>()

const nowDict = ref<Dictionary | undefined>(
  getDictionary(props.dict || settingStore.dictionary)
)
const selectOne = (dict: Dictionary): void => {
  nowDict.value = dict
}

watch(
  () => settingStore.dictionary,
  () => {
    if (settingStore.dictionary) {
      const dict = getDictionary(settingStore.dictionary)
      if (dict) {
        nowDict.value = dict
      }
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

.now-dict {
  display: inline-block;
  width: 24px;
  height: 24px;
}

.now-dict-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background-position: 100% 100%;
}

.now-dict-label {
  position: absolute;
  left: 0;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
