<template>
  <div class="dictionary">
    <el-text v-for="dict in dictionaries">{{ dict.name }} </el-text>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Dictionary } from './index.ts'

//
const dictionaries = ref<Dictionary[]>([
  {
    name: 'Mazii',
    url: 'https://mazii.net/zh-CN/search/word/jacn/{placeholder}',
  },
  {
    name: 'JapanDict',
    url: 'https://www.japandict.com/{placeholder}?lang=eng',
  },
  {
    name: 'JiSho',
    url: ' https://jisho.org/search/{placeholder}',
  },
])
</script>

<style scoped></style>
