<template>
  <div class="dictionary">
    <el-dropdown size="small" split-button type="default">
      <a
        class="now-dict"
        target="_blank"
        :href="toUrl(props.word, nowDict)"
        :title="nowDict.name"
      >
        <img
          class="now-dict-img"
          v-if="nowDict.logo"
          :src="nowDict.logo"
          :alt="nowDict.name"
        />
        <span class="now-dict-label" v-else>{{ nowDict.label }}</span>
      </a>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item
            class="dict-item"
            v-for="dict in dictionaries"
            @click="selectOne(dict)"
          >
            {{ `${dict.label}-${dict.name}` }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Dictionary, DictionaryProps } from './index.ts'

const placeholder = '{word}'

const imageUrlBase = import.meta.env.VITE_IMAGE_BASE

const dictionaries = ref<Dictionary[]>([
  {
    label: 'JD',
    name: 'JapanDict',
    url: `https://www.japandict.com/${placeholder}?lang=eng`,
    logo: `${imageUrlBase}/japan_dict.png`,
  },
  {
    label: 'YD',
    name: 'YouDao',
    url: `https://youdao.com/result?word=${placeholder}&lang=ja`,
    logo: `${imageUrlBase}/you_dao.png`,
  },
  {
    label: 'MZ',
    name: 'Mazii',
    url: `https://mazii.net/zh-CN/search/word/jacn/${placeholder}`,
    logo: `${imageUrlBase}/mazii.png`,
  },
  {
    label: 'JS',
    name: 'JiSho',
    url: `https://jisho.org/search/${placeholder}`,
    logo: `${imageUrlBase}/ji_sho.png`,
  },
])

const props = defineProps<DictionaryProps>()

const defaultDict = computed(() => {
  return (
    dictionaries.value.find((dict) =>
      [dict.label, dict.name].includes(props.dict || '')
    ) || dictionaries.value[0]
  )
})

const nowDict = ref<Dictionary>(defaultDict.value)
const selectOne = (dict: Dictionary): void => {
  nowDict.value = dict
}

const toUrl = (word: string, dict: Dictionary): string => {
  if (!word) {
    return '#'
  }
  return dict.url.replace(placeholder, word)
}
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
