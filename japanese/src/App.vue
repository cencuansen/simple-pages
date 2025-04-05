<template>
  <div class="header">
    <el-button
        class="settings-button"
        :icon="Setting"
        circle
        @click="openSettings"
    />
  </div>
  <Lesson class="body"/>
  <SettingsDialog ref="settingsDialog"/>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {Setting} from '@element-plus/icons-vue'
import SettingsDialog from './components/SettingsDialog.vue'
import Lesson from './components/Lesson.vue'
import {useLessonStore} from './stores/lessonStore'
import {useWordStore} from './stores/wordStore'

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
  height: var(--header-height);
  display: flex;
  align-items: center;
  padding-left: 10px;
}

.body {
  height: calc(100vh - var(--header-height));
  overflow-y: scroll;
}
</style>
