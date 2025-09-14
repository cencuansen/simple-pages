<template>
  <el-form>
    <el-form-item label="音频播放">
      <el-switch v-model="audioSpeak" inline-prompt />
    </el-form-item>

    <el-form-item label="TTS 朗读">
      <el-switch v-model="ttsSpeak" inline-prompt />
    </el-form-item>

    <div v-if="ttsSpeak">
      <el-form-item label="声音">
        <el-select
          v-model="voiceName"
          placeholder="选择语音"
          filterable
          fit-input-width
        >
          <el-option
            v-for="voice in voiceOptions"
            :key="voice.name"
            :label="voice.name"
            :value="voice.name"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="语速">
        <el-slider v-model="rate" :min="0.2" :max="3" :step="0.1" show-input />
      </el-form-item>

      <el-form-item label="音高">
        <el-slider v-model="pitch" :min="0" :max="2" :step="0.1" show-input />
      </el-form-item>

      <el-form-item label="音量">
        <el-slider v-model="volume" :min="0" :max="1" :step="0.1" show-input />
      </el-form-item>

      <el-form-item label="重复">
        <el-input-number v-model="repeatTimes" :min="1" :max="5" />
      </el-form-item>

      <el-form-item label="测试">
        <div class="row">
          <el-input
            v-model.trim="testText"
            placeholder="输入测试文本"
            disabled
          />
          <el-button
            style="margin-left: 10px"
            :loading="isReading"
            @click="ttsOne({ id: testText, text: testText })"
          >
            测试
          </el-button>
        </div>
      </el-form-item>

      <el-form-item>
        <el-button @click="speechStore.reset"> 重置</el-button>
      </el-form-item>
    </div>
  </el-form>
</template>

<script setup lang="ts">
import { useSettingStore } from '@/stores/settingStore.ts'
import { useReadingStore } from '@/stores/readingStore.ts'
import { useSpeechStore } from '@/stores/speechStore.ts'
import { ref } from 'vue'
import { storeToRefs } from 'pinia'

const settingStore = useSettingStore()
const { audioSpeak, ttsSpeak } = storeToRefs(settingStore)

const readingStore = useReadingStore()
const { rate, pitch, volume, repeatTimes, isReading } =
  storeToRefs(readingStore)

const speechStore = useSpeechStore()
const { voiceName, voiceOptions } = storeToRefs(speechStore)
const ttsOne = speechStore.speak

const testText = ref('こんにちは')
</script>

<style scoped>
.row {
  display: flex;
  gap: var(--gap12);
}
</style>
