<template>
  <el-tabs class="setting-container" tab-position="left">
    <el-tab-pane label="一般">
      <el-form label-width="auto">
        <el-form-item label="主题">
          <el-switch v-model="darkMode" inline-prompt :active-icon="Moon" :inactive-icon="Sunny" size="small"/>
        </el-form-item>
        <el-form-item label="注音">
          <el-switch v-model="baseSettingStore.furigana" inline-prompt size="small"/>
        </el-form-item>
        <el-form-item label="单词跳转">
          <el-switch v-model="baseSettingStore.wordLink" inline-prompt size="small"/>
        </el-form-item>
        <el-form-item label="翻译">
          <el-switch v-model="baseSettingStore.translate" inline-prompt size="small"/>
        </el-form-item>
        <el-form-item label="语音">
          <el-switch v-model="baseSettingStore.speak" inline-prompt size="small"/>
        </el-form-item>
        <!--          <el-form-item label="字体大小">-->
        <!--            <el-slider-->
        <!--                v-model="baseSettingStore.style.fontSize"-->
        <!--                :min="10"-->
        <!--                :max="20"-->
        <!--                :step="0.1"-->
        <!--                show-input-->
        <!--                size="small"-->
        <!--            />-->
        <!--          </el-form-item>-->
      </el-form>
    </el-tab-pane>
    <el-tab-pane label="语音">
      <el-form>
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
              :min="0.5"
              :max="2"
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
              v-model="testText"
              placeholder="输入测试文本"
              style="width: 55%"
              size="small"
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
      </el-form>
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
import {Sunny, Moon} from '@element-plus/icons-vue'
import {useBaseSettingStore} from '../stores/baseSettingStore.ts'
import {useSpeechStore} from '../stores/speechStore'
import {ref, computed} from 'vue'
import {storeToRefs} from 'pinia'

const baseSettingStore = useBaseSettingStore()
const visible = ref(false)
const testText = ref('ありがとう')

const darkMode = computed({
  get: () => baseSettingStore.isDark,
  set: (val) => baseSettingStore.toggleDark(val)
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

const open = () => {
  visible.value = true
}

defineExpose({open})
</script>

<style scoped>
.setting-container {
  margin: 10px auto 0;
  max-width: var(--content-max-width);
}

</style>