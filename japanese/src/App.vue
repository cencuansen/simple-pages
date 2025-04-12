<template>
  <div class="header">
    <el-button
        class="settings-button"
        :icon="Setting"
        circle
        @click="openSettings"
        size="small"
    />
    <el-switch
        inline-prompt
        v-model="lessonMode"
        active-text="课程模式"
        inactive-text="单词模式"
    />
  </div>
  <Lesson v-if="lessonMode" class="body"/>
  <Word v-else class="body"/>
  <Settings ref="settingsDialog"/>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {Setting,} from '@element-plus/icons-vue'
import Settings from './components/Setting.vue'
import Lesson from './components/Lesson.vue'
import Word from "./components/Word.vue";
import {useLessonStore} from './stores/lessonStore'
import {useWordStore} from './stores/wordStore'

const lessonMode = ref<boolean>(true)

const settingsDialog = ref()
const openSettings = () => {
  settingsDialog.value?.open()
}

const lessonStore = useLessonStore()
const wordStore = useWordStore()

  onMounted(async () => {
  await wordStore.fetchWords()
  await lessonStore.fetchLessons()
})
</script>

<style scoped>
.header {
  max-width: var(--content-max-width);
  margin: 0 auto;
  height: var(--header-height);
  display: flex;
  align-items: center;
}

.header > * {
  margin-right: 10px;
}

.header > *:last-child {
  margin-right: 0;
}

.body {
  height: calc(100vh - var(--header-height));
}
</style>
