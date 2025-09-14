<template>
  <el-button
    v-if="usable"
    :disabled="isReading || disabled"
    :loading="isReading"
    @click="req"
  >
    {{ content }}
  </el-button>
  <audio ref="audio" autoplay />
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'

import { useReadingStore } from '@/stores/readingStore.ts'
import { useVoiceVoxStore } from '@/stores/voiceVox/voiceVoxStore.ts'
import { storeToRefs } from 'pinia'

const readingStore = useReadingStore()
const { isReading } = storeToRefs(readingStore)
const setIsReading = readingStore.setIsReading

const voiceVoxStore = useVoiceVoxStore()
const synthesis = voiceVoxStore.synthesis
const { usable } = storeToRefs(voiceVoxStore)

const props = defineProps({
  text: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  content: {
    type: String,
    default: 'VoiceVox',
  },
})

const audio = ref()

const req = async () => {
  try {
    setIsReading(true)
    const bytes = await synthesis(props.text)
    audio.value.src = URL.createObjectURL(new Blob([bytes]))
  } catch (_) {
    setIsReading(false)
  }
}

onMounted(() => {
  audio.value.addEventListener('ended', () => {
    setIsReading(false)
  })
  audio.value.addEventListener('error', () => {
    setIsReading(false)
  })
})
</script>

<style scoped></style>
