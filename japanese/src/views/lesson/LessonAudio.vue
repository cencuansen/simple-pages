<template>
  <div class="audio">
    <audio
      ref="audioRef"
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
import { useAudioStore } from '@/stores/audioStore.ts'

import { ref, watch } from 'vue'

const audioStore = useAudioStore()
const onTimeUpdate = audioStore.onTimeUpdate
const onPlay = audioStore.onPlay
const onPause = audioStore.onPause
const onError = audioStore.onError
const onAbort = audioStore.onAbort

const audioRef = ref<HTMLAudioElement>()

watch(
  () => audioRef.value,
  () => {
    audioStore.setAudioRef(audioRef.value)
  }
)
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
