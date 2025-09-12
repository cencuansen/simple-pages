<template>
  <el-button @click="req" :disabled="disabled">VoiceVox</el-button>
  <audio ref="audio" autoplay></audio>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { useReadingStore } from '../../stores/readingStore.ts'

const readingStore = useReadingStore()
const setIsReading = readingStore.setIsReading

const props = defineProps({
  text: {
    type: String,
    default: '世界の第一位です',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const audio = ref()

const req = async () => {
  const host = 'http://localhost:50121'
  const speaker = '10005'
  const audio_query = `${host}/audio_query?text=${encodeURIComponent(props.text)}&speaker=${speaker}`
  const synthesis = `${host}/synthesis?speaker=${speaker}`
  const audioQueryResponse = await fetch(audio_query, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  const audioQueryResult = await audioQueryResponse.json()

  const synthesisResponse = await fetch(synthesis, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(audioQueryResult),
  })
  const bytes = await synthesisResponse.arrayBuffer()
  audio.value.addEventListener('ended', () => {
    setIsReading(false)
  })
  audio.value.src = URL.createObjectURL(new Blob([bytes]))
  setIsReading(true)
}
</script>

<style scoped></style>
