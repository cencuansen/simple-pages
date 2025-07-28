<template>
  <div class="header">
    <div class="buttons">
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
        词汇
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
          :type="isActive('/jlpt-grammar') ? 'primary' : 'default'"
          @click="navigateTo('/jlpt-grammar')"
      >
        文法(jlpt)
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
import {useJlptGrammarStore} from './stores/jlptGrammarStore'
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
const jlptGrammarStore = useJlptGrammarStore()

onMounted(async () => {
  await wordStore.fetchWords()
  await lessonStore.fetchLessons()
  await grammarStore.fetchGrammars()
  await jlptGrammarStore.fetchJlptGrammars()
})
</script>

<style>

</style>

<style scoped>
.header {
  overflow-y: scroll;
  width: 100%;
  display: flex;
  justify-content: center;
}

.buttons {
  height: 40px;
  display: flex;
  align-items: center;
  overflow-x: auto;
}

.buttons::-webkit-scrollbar {
  display: none;
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
