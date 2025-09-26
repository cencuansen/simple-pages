<template>
  <div class="lesson-headers">
    <div class="lesson-switch">
      <el-button :disabled="!hasPrevious" @click="goPrevious">
        上一课
      </el-button>
      <LessonSelect v-model="currentIndex" :clearable="false" fit-input-width />
      <el-button :disabled="!hasNext" @click="goNext"> 下一课 </el-button>
    </div>
    <div class="function-group">
      <el-button
        :type="settingStore.allTranslate ? 'primary' : ''"
        title="翻译"
        v-if="settingStore.translate"
        @click="settingStore.setAllTranslate(!settingStore.allTranslate)"
      >
        翻译
      </el-button>
      <el-button
        :type="settingStore.furigana ? 'primary' : ''"
        title="注音"
        @click="settingStore.furiganaToggle"
      >
        注音
      </el-button>
      <el-button
        :type="settingStore.wordLink ? 'primary' : ''"
        title="单词跳转"
        @click="settingStore.wordLinkToggle"
      >
        跳转
      </el-button>
      <el-button title="搜索" @click="setDialog(!dialog)">
        搜索
      </el-button>
      <el-button title="全屏" v-if="!fullscreen" @click="toggleFullscreen">
        全屏
      </el-button>
      <el-button
        :type="''"
        title="播放"
        :disabled="isReading"
        v-if="hasAudio && settingStore.audioSpeak"
        @click="playAudio({ id: lessonAudio || '', text: lessonAudio || '' })"
      >
        播放
      </el-button>
      <el-button
        v-if="isReading"
        title="停止播放"
        @click="
          () => {
            stopSpeech()
            pauseAudio()
          }
        "
      >
        停止
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'

import { useReadingStore } from '@/stores/readingStore.ts'
import { useAudioStore } from '@/stores/audioStore.ts'
import { useSpeechStore } from '@/stores/speechStore.ts'
import { useLessonStore } from '@/stores/lessonStore.ts'
import { useSettingStore } from '@/stores/settingStore.ts'

import LessonSelect from '../../components/LessonSelect.vue'

const readingStore = useReadingStore()

const audioStore = useAudioStore()
const speechStore = useSpeechStore()
const lessonStore = useLessonStore()
const settingStore = useSettingStore()

const { isReading } = storeToRefs(readingStore)

const { dialog, currentIndex, hasPrevious, hasNext, hasAudio, lessonAudio } =
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
  overflow-y: hidden;
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
  justify-content: safe center;
  overflow-x: scroll;
  overflow-y: hidden;
  width: 100%;
  max-width: var(--content-max-width);
}

.function-group::-webkit-scrollbar {
  display: none;
}
</style>
