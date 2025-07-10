<template>
  <div class="nav-container">
    <div class="nav-buttons">
      <el-button
          size="small"
          :type="isActive('/lesson') ? 'primary' : 'default'"
          @click="navigateTo('/lesson')"
      >
        课程
      </el-button>
      <el-button
          size="small"
          :type="isActive('/word') ? 'primary' : 'default'"
          @click="navigateTo('/word')"
      >
        单词
      </el-button>
      <el-button
          size="small"
          :type="isActive('/vocabulary') ? 'primary' : 'default'"
          @click="navigateTo('/vocabulary')"
      >
        词汇(jlpt)
      </el-button>
      <el-button
          size="small"
          :type="isActive('/grammar') ? 'primary' : 'default'"
          @click="navigateTo('/grammar')"
      >
        文法
      </el-button>
      <el-button
          size="small"
          :type="isActive('/tool') ? 'primary' : 'default'"
          @click="navigateTo('/tool')"
      >
        工具
      </el-button>
      <el-button
          size="small"
          :type="isActive('/setting') ? 'primary' : 'default'"
          @click="navigateTo('/setting')"
      >
        设置
      </el-button>
    </div>
  </div>
  <router-view v-slot="{ Component }">
    <keep-alive>
      <component :is="Component"/>
    </keep-alive>
  </router-view>
</template>

<script setup lang="ts">
import {onMounted} from 'vue'
import {useLessonStore} from './stores/lessonStore'
import {useWordStore} from './stores/wordStore'
import {useGrammarStore} from './stores/grammarStore'
import {useBaseSettingStore} from "./stores/baseSettingStore"
import {useRouter, useRoute} from 'vue-router'

const router = useRouter()
const route = useRoute()
useBaseSettingStore();

const navigateTo = (path: string) => {
  router.push(path)
}

const isActive = (path: string) => {
  return route.path === path
}

const lessonStore = useLessonStore()
const wordStore = useWordStore()
const grammarStore = useGrammarStore()

onMounted(async () => {
  await wordStore.fetchWords()
  await lessonStore.fetchLessons()
  await grammarStore.fetchGrammars()
})
</script>

<style>

</style>

<style scoped>
.nav-container {
  display: flex;
  justify-content: center;
}

.nav-buttons {
  height: 40px;
  display: flex;
  align-items: center;
  overflow-x: auto;
}

.nav-buttons::-webkit-scrollbar {
  display: none;
}

.nav-buttons button {
  margin: 0 10px;
}

.root-tab {
  height: 100vh;
  width: 100vw;
  border: none;
}

:deep(.el-tabs__content) {
  padding: 0 !important;
}

</style>
