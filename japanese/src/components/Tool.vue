<template>
  <div class="tool-container">
    <el-tabs class="setting-container">
      <el-tab-pane label="假名注音">
        <el-form label-width="auto" v-loading="loading">
          <el-form-item label="输入文本">
            <div class="item-group">
              <el-input
                size="small"
                v-model="inputText"
                type="textarea"
                clearable
                @clear="onClear"
              ></el-input>
              <el-button size="small" @click="convertHandler">转换</el-button>
            </div>
          </el-form-item>
          <el-form-item label="-">
            <div class="item-group">
              <el-text v-html="hiraganaResult" class="result-item"></el-text>
              <el-button
                v-if="baseSettingStore.ttsSpeak && hiraganaResult"
                size="small"
                class="speak-button"
                :disabled="speechStore.isSpeaking"
                @click="speechStore.speak(hiraganaResult)"
              >
                <el-icon>
                  <i class="icon-on-MPIS-TTS"></i>
                </el-icon>
              </el-button>
            </div>
          </el-form-item>
          <el-form-item label="-">
            <el-text v-html="okuriganaResult" class="result-item"></el-text>
          </el-form-item>
          <el-form-item label="-">
            <el-text
              v-html="toDataRuby(furiganaResult)"
              class="result-item ruby-result-item"
            ></el-text>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="日文朗读">
        <div class="text-speak-pane">
          <el-input
            class="text-speak-textarea"
            size="small"
            type="textarea"
            v-model.trim="textToSpeak"
            :autosize="{ minRows: 5, maxRows: 10 }"
            placeholder="请输入需要朗读的 '日文文本'"
          ></el-input>
          <div class="text-speak-button-group">
            <el-button
              size="small"
              @click="speechStore.speak(textToSpeak)"
              :disabled="speechStore.isSpeaking"
              >朗读
            </el-button>
            <el-button
              size="small"
              type="warning"
              @click="speechStore.stop"
              v-if="speechStore.isSpeaking"
              >终止
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="onSpeakTextClear"
              v-if="textToSpeak"
              >清空
            </el-button>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { ref } from 'vue'
import ky from 'ky'
import { useSpeechStore } from '../stores/speechStore'
import { useBaseSettingStore } from '../stores/baseSettingStore'

const speechStore = useSpeechStore()
const baseSettingStore = useBaseSettingStore()

const loading = ref(false)
const inputText = ref('')
const hiraganaResult = ref('')
const okuriganaResult = ref('')
const furiganaResult = ref('')

const textToSpeak = ref('')

// const hiraganaUrl = "https://kuroshiro-vercel.vercel.app/hiragana";
const hiraganaUrl = 'https://kuroshiro.chengshen.me/hiragana'

const convertHandler = async () => {
  if (!inputText.value) {
    return
  }
  loading.value = true
  try {
    const response = await ky.post(hiraganaUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: inputText.value,
      }),
      timeout: 15000,
    })
    const data: any = await response.json()
    // hiragana(平假名) → おしごとちゅう
    hiraganaResult.value = data.hiragana
    // furigana(振假名) → お<ruby>仕事<rp>(</rp><rt>しごと</rt><rp>)</rp></ruby><ruby>中<rp>(</rp><rt>ちゅう</rt><rp>)</rp></ruby>
    furiganaResult.value = data.furigana
    // okurigana(送假名) → お仕事(しごと)中(ちゅう)
    okuriganaResult.value = data.okurigana
  } catch (err: any) {
    if (err.message.includes('timed out')) {
      ElMessage.error('请求超时')
    } else {
      ElMessage.error(err.message)
    }
  } finally {
    loading.value = false
  }
}

const onClear = () => {
  hiraganaResult.value = ''
  okuriganaResult.value = ''
  furiganaResult.value = ''
}

const onSpeakTextClear = () => {
  textToSpeak.value = ''
  speechStore.stop()
}

const toDataRuby = (text: string): string => {
  return text.replace(/<rt>(.*?)<\/rt>/g, '<rt data-ruby="$1"></rt>')
}
</script>

<style scoped>
.tool-container {
  width: 100%;
  margin: 0 auto;
  max-width: var(--content-max-width);
}

.item-group {
  width: 100%;
  display: flex;
  gap: 10px;
  justify-content: space-between;
}

.speak-button {
  width: 48px;
  box-sizing: border-box;
  flex: none;
}

.text-speak-textarea {
  margin-bottom: 10px;
}

.text-speak-button-group {
  display: flex;
}

.ruby-result-item {
  font-size: 1.5rem;
  line-height: 3rem;
}
</style>
