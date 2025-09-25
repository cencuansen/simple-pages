<template>
  <div class="tab-pane">
    <div class="row">
      <el-input
        class="row"
        type="textarea"
        v-model.trim="text"
        :autosize="{ minRows: 5 }"
        placeholder="请输入需要朗读的 '日文文本'"
      ></el-input>
    </div>
    <div class="row">
      <div>
        <el-button
          :disabled="!text || isReading"
          @click="ttsOne({ id: text, text: text })"
        >
          朗读
        </el-button>
      </div>
      <VoiceVox :text="text" :disabled="!text" />
      <div v-if="isReading">
        <el-button type="warning" @click="speechStore.stop"> 终止</el-button>
      </div>
      <div v-if="text && !isReading">
        <el-button type="danger" @click="clear">清空</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useReadingStore } from '@/stores/readingStore.ts'
import { useSpeechStore } from '@/stores/speechStore.ts'
import { storeToRefs } from 'pinia'
import VoiceVox from '../../components/VoiceVox/VoiceVox.vue'

const readingStore = useReadingStore()
const { isReading } = storeToRefs(readingStore)

const speechStore = useSpeechStore()
const ttsOne = speechStore.speak

const text = ref('')

const clear = () => {
  text.value = ''
  speechStore.stop()
}
</script>

<style scoped></style>
