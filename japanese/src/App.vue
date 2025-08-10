<template>
  <div class="header">
    <div class="button-group">
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
          :type="isActive('/verb-conju') ? 'primary' : 'default'"
          @click="navigateTo('/verb-conju')"
      >
        动词活用
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
  <div class="router-view">
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component"/>
      </keep-alive>
    </router-view>
  </div>
  <div class="footer">

  </div>
</template>

<script setup lang="ts">
import {onMounted} from 'vue'
import {useLessonStore} from './stores/lessonStore'
import {useWordStore} from './stores/wordStore'
import {useGrammarStore} from './stores/grammarStore'
import {useJlptGrammarStore} from './stores/jlptGrammarStore'
import {useBaseSettingStore} from "./stores/baseSettingStore"
import {useConjuStore} from "./stores/conjuStore.ts"
import {useRouter, useRoute} from 'vue-router'
import {detectBrowser} from './utils.ts'


onMounted(() => {
  let rootFooterHeight = '0px'
  const {type, browser} = detectBrowser()
  if (type === 'desktop') {
    rootFooterHeight = '0px'
  } else {
    if (browser === 'chrome') {
      rootFooterHeight = '55px'
    } else if (browser === 'edge') {
      rootFooterHeight = '105px'
    } else {
      rootFooterHeight = '0px'
    }
  }
  // 关键：直接设置CSS变量到文档根元素
  document.documentElement.style.setProperty('--root-footer-height', rootFooterHeight)
})

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
const verbConju = useConjuStore()

onMounted(async () => {
  await wordStore.fetchWords()
  await lessonStore.fetchLessons()
  await grammarStore.fetchGrammars()
  await jlptGrammarStore.fetchJlptGrammars()
  await verbConju.fetchVerbConjus()
})
</script>

<style>

</style>

<style>
:root {
  --gap12: 12px;

  --root-header-height: 40px;
  /* default */
  --root-footer-height: 0px;
  /* desktop */
  /*--root-footer-height: 0px;*/
  /* android chrome */
  /*--root-footer-height: 55px;*/
  /* android edge */
  /*--root-footer-height: 105px;*/
}
</style>

<style scoped>
.header {
  display: flex;
  align-items: center;
  padding: 0 5px;
  height: var(--root-header-height);
  width: 100%;
  justify-content: center;
  overflow-y: scroll;
}

.button-group {
  display: flex;
  align-items: center;
  overflow-x: scroll;
}

.button-group::-webkit-scrollbar {
  display: none;
}

.router-view {
  width: 100vw;
  height: calc(100% - var(--root-header-height));
  position: fixed;
  display: flex;
  overflow: hidden;
}

/*
:deep(.el-tabs__content) {
  padding: 0 !important;
}
*/

.footer {
  width: 100%;
  height: var(--root-footer-height);
}
</style>
