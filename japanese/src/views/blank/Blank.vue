<template>
  <div class="row">
    <el-input type="textarea" v-model="text"></el-input>
    <el-button @click="req">请求</el-button>
    <div>结果：{{ data }}</div>
    <audio ref="audio" autoplay></audio>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const audio = ref()
const data = ref('')
const text = ref('世界の第一位です')

const req = async () => {
  const host = 'http://localhost:50121'
  const speaker = '10005'
  const audio_query = `${host}/audio_query?text=${encodeURIComponent(text.value)}&speaker=${speaker}`
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
  audio.value.src = URL.createObjectURL(new Blob([bytes]))
}
</script>

<style scoped></style>
