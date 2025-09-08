<template>
  <div class="audio">
    <audio
      ref="audioRef"
      :src="src"
      controls
      @timeupdate="onTimeUpdate"
      @play="onPlay"
      @pause="onPause"
      @error="onError"
      @abort="onAbort"
    ></audio>
  </div>
</template>

<script setup lang="ts">
import { useSettingStore } from '../../stores/settingStore.ts'
import { useLessonStore } from '../../stores/lessonStore.ts'
import { useSpeechStore } from '../../stores/speechStore.ts'

import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import { speakingId } from '../../utils'

const settingStore = useSettingStore()

const lessonStore = useLessonStore()
const { lessonAudio } = storeToRefs(lessonStore)

const speechStore = useSpeechStore()
const { isSpeaking } = storeToRefs(speechStore)

const audioRef = ref<HTMLAudioElement>()
const currentTime = ref(0)
const audioPlaying = ref(false)

const isPlaying = computed(() => isSpeaking.value || audioPlaying.value)

const src = computed(() => {
  if (isSpeaking.value) {
    return void 0
  }
  return `${audioUrlBase}${lessonAudio.value}`
})

const pauseHandler = async (url: string, playTimes: number) => {
  await playAudio(url, playTimes - 1)
}

let currentPauseHandler: (() => void) | null = null

const playAudio = async (timeRange: string, playTimes: number) => {
  if (!audioRef.value || !src.value || playTimes < 1) {
    return
  }

  const url = `${src.value}${timeRange}`
  audioRef.value.src = url

  // 移除旧的监听器
  if (currentPauseHandler) {
    audioRef.value?.removeEventListener('pause', currentPauseHandler)
  }
  // 创建并存储新的处理函数
  currentPauseHandler = () => pauseHandler(url, playTimes)
  audioRef.value?.addEventListener('pause', currentPauseHandler)

  audioRef.value.playbackRate = speechStore.rate
  audioRef.value.volume = speechStore.volume

  await audioRef.value.play()
}

const pauseAudio = () => {
  if (!isPlaying.value) return

  if (audioPlaying.value && audioRef.value) {
    // 移除监听器
    if (currentPauseHandler) {
      audioRef.value.removeEventListener('pause', currentPauseHandler)
      currentPauseHandler = null
    }
    audioRef.value.pause()
  }

  if (isSpeaking.value) {
    speechStore.stop()
  }
}

const audioUrlBase = import.meta.env.VITE_AUDIO_BASE

watch(
  () => settingStore.translate,
  (value, _) => {
    if (!value) {
      // 设置中关闭翻译功能时
      settingStore.setAllTranslate(false)
    }
  }
)

watch(
  () => speechStore.lastFireTime,
  (_) => {
    const id = speakingId()
    if (!id) {
      return
    }
    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
    })
  }
)

const onTimeUpdate = () => {
  currentTime.value = audioRef.value?.currentTime || 0
}
const onPlay = () => {
  audioPlaying.value = true
}
const onPause = () => {
  audioPlaying.value = false
}
const onError = () => {
  audioPlaying.value = false
}
const onAbort = () => {
  audioPlaying.value = false
}

const speakingActive = (
  timeStr: string,
  currentTime: number,
  text: string = ''
): boolean => {
  if (text !== null && text.length > 0 && speechStore.speakingText === text) {
    return true
  }
  if (!audioRef.value || audioRef.value.paused) {
    return false
  }
  if (!timeStr || !currentTime) {
    return false
  }
  const timePart = timeStr.split(',').map(Number)
  return currentTime > timePart[0] && currentTime < timePart[1]
}

// 暴露方法给父组件
defineExpose({
  playAudio,
  pauseAudio,
  speakingActive,
  audioPlaying,
  isPlaying,
  currentTime,
})
</script>

<style scoped>
.audio {
  width: 100%;
  overflow-y: scroll;
  height: var(--audio-height);
}

audio {
  display: block;
  margin: 0 auto;
  width: 100%;
  max-width: var(--content-max-width);
}
</style>
