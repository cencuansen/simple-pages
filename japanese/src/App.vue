<template>
  <el-tabs type="border-card" class="root-tab">
    <el-tab-pane label="课程">
      <Lesson/>
    </el-tab-pane>
    <el-tab-pane label="单词">
      <Word/>
    </el-tab-pane>
    <el-tab-pane label="工具">
      <Tool/>
    </el-tab-pane>
    <el-tab-pane label="设置">
      <Settings/>
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
import {onMounted} from 'vue'
import Settings from './components/Setting.vue'
import Lesson from './components/Lesson.vue'
import Word from "./components/Word.vue";
import Tool from "./components/Tool.vue";
import {useLessonStore} from './stores/lessonStore'
import {useWordStore} from './stores/wordStore'
import {useGrammarStore} from './stores/grammarStore'

const lessonStore = useLessonStore()
const wordStore = useWordStore()
const grammarStore = useGrammarStore()

onMounted(async () => {
  await wordStore.fetchWords()
  await lessonStore.fetchLessons()
  await grammarStore.fetchGrammars()
})
</script>

<style scoped>
.root-tab {
  height: 100vh;
  width: 100vw;
  border: none;
}

:deep(.el-tabs__content) {
  padding: 0 !important;
}
</style>
