<template>
  <el-button size="small" circle :disabled="isPlaying" @click="handlePlay">
    <el-icon>
      <i class="icon-on-music" v-if="useAudio"></i>
      <i class="icon-on-MPIS-TTS" v-else></i>
    </el-icon>
  </el-button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSpeechStore } from '../stores/speechStore.ts'
import { useSettingStore } from '../stores/settingStore.ts'

const props = defineProps<{
  time?: string
  text?: string
}>()

const emit = defineEmits(['playAudio'])

const speechStore = useSpeechStore()
const settingStore = useSettingStore()

const isPlaying = computed(
  () => speechStore.isSpeaking
)

const useAudio = computed(() => props.time && settingStore.audioSpeak)

const handlePlay = () => {
  if (useAudio.value) {
    emit('playAudio', props.time, speechStore.repeatTimes)
  } else if (settingStore.ttsSpeak && props.text) {
    speechStore.speak(props.text)
  }
}
</script>
