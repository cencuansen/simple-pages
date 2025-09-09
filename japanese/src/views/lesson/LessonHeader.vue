<template>
  <div class="lesson-headers">
    <div class="lesson-switch">
      <el-button size="small" :disabled="!hasPrevious" @click="goPrevious">
        上一课
      </el-button>
      <LessonSelect v-model="currentIndex" :clearable="false" />
      <el-button size="small" :disabled="!hasNext" @click="goNext">
        下一课
      </el-button>
    </div>
    <div class="function-group">
      <el-button
        :type="settingStore.allTranslate ? 'primary' : ''"
        size="small"
        circle
        title="翻译"
        v-if="settingStore.translate"
        @click="settingStore.setAllTranslate(!settingStore.allTranslate)"
      >
        译
      </el-button>
      <el-button
        :type="settingStore.furigana ? 'primary' : ''"
        size="small"
        circle
        title="注音"
        @click="settingStore.furiganaToggle"
      >
        注
      </el-button>
      <el-button
        :type="settingStore.wordLink ? 'primary' : ''"
        size="small"
        circle
        title="单词跳转"
        @click="settingStore.wordLinkToggle"
      >
        跳
      </el-button>
      <el-button
        :type="''"
        size="small"
        circle
        title="搜索"
        @click="setDialog(!dialog)"
      >
        搜
      </el-button>
      <el-button
        size="small"
        circle
        title="全屏"
        v-if="!fullscreen"
        @click="toggleFullscreen"
      >
        全
      </el-button>
      <el-button
        :type="''"
        size="small"
        circle
        title="播放"
        :disabled="isReading"
        v-if="hasAudio && settingStore.audioSpeak"
        @click="playAudio()"
      >
        读
      </el-button>
      <el-button
        :type="''"
        size="small"
        circle
        v-if="isReading"
        title="停止播放"
        @click="
          () => {
            stopSpeech()
            pauseAudio()
          }
        "
      >
        停
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'

import { useReadingStore } from '../../stores/readingStore.ts'
import { useAudioStore } from '../../stores/audioStore.ts'
import { useSpeechStore } from '../../stores/speechStore.ts'
import { useLessonStore } from '../../stores/lessonStore.ts'
import { useSettingStore } from '../../stores/settingStore.ts'

import LessonSelect from '../../components/LessonSelect.vue'

const readingStore = useReadingStore()

const audioStore = useAudioStore()
const speechStore = useSpeechStore()
const lessonStore = useLessonStore()
const settingStore = useSettingStore()

const { isReading } = storeToRefs(readingStore)

const { dialog, currentIndex, hasPrevious, hasNext, hasAudio } =
  storeToRefs(lessonStore)
const goPrevious = lessonStore.goPrevious
const goNext = lessonStore.goNext
const setDialog = lessonStore.setDialog

const stopSpeech = speechStore.stop

const playAudio = audioStore.playAudio
const pauseAudio = audioStore.pauseAudio

const { fullscreen } = storeToRefs(settingStore)

const toggleFullscreen = (newStatus: boolean | null = null) => {
  settingStore.setFullscreen(newStatus !== null ? newStatus : !fullscreen.value)
}
</script>

<style scoped>
.lesson-headers {
  height: var(--lesson-headers-height);
  width: 100%;
  overflow-y: scroll;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

.lesson-switch {
  width: 100%;
  margin: 0 auto;
  text-align: center;
  max-width: var(--content-max-width);
  display: flex;
  justify-content: space-between;
  position: relative;
  gap: var(--gap12);
}

.function-group {
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;
}
</style>
