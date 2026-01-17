<template>
  <div class="lesson-headers">
    <div class="lesson-switch">
      <el-button :disabled="!hasPrev" @click="goPrevious"> 上一课 </el-button>
      <LessonSelect v-model="currentIndex" :clearable="false" fit-input-width />
      <el-button :disabled="!hasNext" @click="goNext"> 下一课 </el-button>
    </div>
    <div class="function-group">
      <el-button
        :type="settingStore.allTranslate ? 'primary' : ''"
        title="翻译"
        v-if="settingStore.translate"
        @click="toggleTranslate"
      >
        翻译 <span class="hot-key-info">ALT+T</span>
      </el-button>
      <el-button
        :type="settingStore.furigana ? 'primary' : ''"
        title="注音"
        @click="settingStore.furiganaToggle"
      >
        注音 <span class="hot-key-info">ALT+H</span>
      </el-button>
      <el-button
        :type="settingStore.wordLink ? 'primary' : ''"
        title="单词跳转"
        @click="settingStore.wordLinkToggle"
      >
        跳转 <span class="hot-key-info">ALT+W</span>
      </el-button>
      <el-button title="搜索" @click="toggleDialog">
        搜索 <span class="hot-key-info">ALT+S</span>
      </el-button>
      <el-button title="全屏" v-if="!fullscreen" @click="toggleFullscreen">
        全屏 <span class="hot-key-info">ALT+F</span>
      </el-button>
      <el-button
        :type="''"
        title="播放"
        :disabled="isReading"
        v-if="settingStore.audioSpeak"
        @click="playAudio({ id: lessonAudio || '', text: lessonAudio || '' })"
      >
        播放 <span class="hot-key-info">ALT+P</span>
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
        停止 <span class="hot-key-info">ALT+P</span>
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'

import { useReadingStore } from '@/stores/readingStore'
import { useAudioStore } from '@/stores/audioStore'
import { useSpeechStore } from '@/stores/speechStore'
import { useLessonStore } from '@/stores/lessonStore'
import { useSettingStore } from '@/stores/settingStore'

import LessonSelect from '@/components/LessonSelect.vue'

const readingStore = useReadingStore()

const audioStore = useAudioStore()
const speechStore = useSpeechStore()
const lessonStore = useLessonStore()
const settingStore = useSettingStore()

const { isReading } = storeToRefs(readingStore)

import { hasNext, hasPrev } from '@/utils/lesson'

const { currentIndex, lessonAudio } = storeToRefs(lessonStore)
const goPrevious = lessonStore.goPrevious
const goNext = lessonStore.goNext

const stopSpeech = speechStore.stop

const playAudio = audioStore.playAudio
const pauseAudio = audioStore.pauseAudio

const props = defineProps(['dialog', 'fullscreen'])
const emit = defineEmits(['update:dialog', 'update:fullscreen'])

const toggleTranslate = settingStore.toggleTranslate

const toggleDialog = () => {
  emit('update:dialog', !props.dialog)
}

const toggleFullscreen = () => {
  emit('update:fullscreen', !props.fullscreen)
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

.hot-key-info {
  font-size: 0.8rem;
  margin-left: 3px;
}
</style>
