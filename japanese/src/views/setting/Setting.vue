<template>
  <el-tabs class="setting-container" tab-position="top">
    <el-tab-pane label="通用">
      <el-form>
        <el-form-item label="切换主题">
          <el-switch
            v-model="darkMode"
            inline-prompt
            :active-icon="Moon"
            :inactive-icon="Sunny"
            size="small"
          />
        </el-form-item>
        <el-form-item label="显示注音">
          <el-switch
            v-model="baseSettingStore.furigana"
            inline-prompt
            size="small"
          />
        </el-form-item>
        <el-form-item label="单词跳转">
          <el-switch
            v-model="baseSettingStore.wordLink"
            inline-prompt
            size="small"
          />
        </el-form-item>
        <el-form-item label="翻译功能">
          <el-switch
            v-model="baseSettingStore.translate"
            inline-prompt
            size="small"
          />
        </el-form-item>
        <el-form-item label="显示单词">
          <el-switch
            v-model="baseSettingStore.word"
            inline-prompt
            size="small"
          />
        </el-form-item>
        <el-form-item label="单词假名">
          <el-switch
            v-model="baseSettingStore.kana"
            inline-prompt
            size="small"
          />
        </el-form-item>
        <el-form-item label="单词释义">
          <el-switch
            v-model="baseSettingStore.wordDesc"
            inline-prompt
            size="small"
          />
        </el-form-item>
      </el-form>
    </el-tab-pane>
    <el-tab-pane label="语音">
      <el-form>
        <el-form-item label="音频播放">
          <el-switch
            v-model="baseSettingStore.audioSpeak"
            inline-prompt
            size="small"
          />
        </el-form-item>

        <el-form-item label="TTS 朗读">
          <el-switch
            v-model="baseSettingStore.ttsSpeak"
            inline-prompt
            size="small"
          />
        </el-form-item>

        <div v-if="baseSettingStore.ttsSpeak">
          <el-form-item label="语音">
            <el-select
              v-model="voiceName"
              placeholder="选择语音"
              filterable
              fit-input-width
              size="small"
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
            <el-slider
              v-model="rate"
              :min="0.2"
              :max="3"
              :step="0.1"
              show-input
              size="small"
            />
          </el-form-item>

          <el-form-item label="音高">
            <el-slider
              v-model="pitch"
              :min="0"
              :max="2"
              :step="0.1"
              show-input
              size="small"
            />
          </el-form-item>

          <el-form-item label="音量">
            <el-slider
              v-model="volume"
              :min="0"
              :max="1"
              :step="0.1"
              show-input
              size="small"
            />
          </el-form-item>

          <el-form-item label="重复">
            <el-input-number
              v-model="repeatTimes"
              :min="1"
              :max="5"
              size="small"
            />
          </el-form-item>

          <el-form-item label="测试">
            <el-input
              v-model.trim="testText"
              placeholder="输入测试文本"
              style="width: 55%"
              size="small"
              disabled
            />
            <el-button
              style="margin-left: 10px"
              :loading="isSpeaking"
              size="small"
              @click="speechStore.speak(testText)"
            >
              测试
            </el-button>
          </el-form-item>

          <el-form-item>
            <el-button @click="speechStore.reset()" size="small">
              重置
            </el-button>
          </el-form-item>
        </div>
      </el-form>
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
import { Sunny, Moon } from '@element-plus/icons-vue'
import { useBaseSettingStore } from '../../stores/baseSettingStore.ts'
import { useSpeechStore } from '../../stores/speechStore.ts'
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'

const baseSettingStore = useBaseSettingStore()
const testText = ref('こんにちは')

const darkMode = computed({
  get: () => baseSettingStore.isDark,
  set: (val) => baseSettingStore.toggleDark(val),
})

// 语音设置
const speechStore = useSpeechStore()
const {
  rate,
  pitch,
  volume,
  repeatTimes,
  voiceName,
  voiceOptions,
  isSpeaking,
} = storeToRefs(speechStore)
</script>

<style scoped>
.setting-container {
  width: 100%;
  margin: 0 auto;
  max-width: var(--content-max-width);
}
</style>
