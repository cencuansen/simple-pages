<template>
  <el-dialog
      v-model="visible"
      title="系统配置"
      :close-on-click-modal="false"
  >
    <el-tabs type="border-card">
      <!-- 主题设置标签页 -->
      <el-tab-pane label="主题设置">
        <el-form>
          <el-form-item label="主题模式">
            <el-switch
                v-model="darkMode"
                inline-prompt
                active-text="暗黑"
                inactive-text="明亮"
                :active-icon="Moon"
                :inactive-icon="Sunny"
            />
          </el-form-item>

        </el-form>
      </el-tab-pane>

      <!-- 语音设置标签页 -->
      <el-tab-pane label="语音设置">
        <el-form>
          <el-form-item label="语音选择">
            <el-select
                v-model="voiceName"
                placeholder="选择语音"
                filterable
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
            />
          </el-form-item>

          <el-form-item label="音高">
            <el-slider
                v-model="pitch"
                :min="0"
                :max="2"
                :step="0.1"
                show-input
            />
          </el-form-item>

          <el-form-item label="音量">
            <el-slider
                v-model="volume"
                :min="0"
                :max="1"
                :step="0.1"
                show-input
            />
          </el-form-item>

          <el-form-item label="重复次数">
            <el-input-number
                v-model="repeatTimes"
                :min="1"
                :max="5"
            />
          </el-form-item>

          <el-form-item label="测试语音">
            <el-input
                v-model="testText"
                placeholder="输入测试文本"
                style="width: 55%"
            />
            <el-button
                style="margin-left: 10px"
                :loading="isSpeaking"
                @click="speechStore.speak(testText)"
            >
              测试
            </el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import {Sunny, Moon} from '@element-plus/icons-vue'
import {useThemeStore} from '../stores/themeStore'
import {useSpeechStore} from '../stores/speechStore'
import {ref, computed} from 'vue'
import {storeToRefs} from 'pinia'

const themeStore = useThemeStore()
const visible = ref(false)
const testText = ref('ありがとう')

const darkMode = computed({
  get: () => themeStore.isDark,
  set: (val) => themeStore.toggleDark(val)
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

const handleConfirm = () => {
  visible.value = false
}

defineExpose({open})
</script>

<style scoped>

</style>