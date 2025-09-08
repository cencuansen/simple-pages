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
import { useAudioStore } from '../../stores/audioStore.ts'
import { useSpeechStore } from '../../stores/speechStore.ts'

import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'

const audioStore = useAudioStore()
const { src } = storeToRefs(audioStore)
const onTimeUpdate = audioStore.onTimeUpdate
const onPlay = audioStore.onPlay
const onPause = audioStore.onPause
const onError = audioStore.onError
const onAbort = audioStore.onAbort

const speechStore = useSpeechStore()
const audioRef = ref<HTMLAudioElement>()

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

watch(
  () => audioRef.value,
  () => {
    audioStore.setAudioRef(audioRef.value)
  }
)

// 暴露方法给父组件
defineExpose({
  speakingActive,
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
