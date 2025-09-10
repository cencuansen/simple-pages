<template>
  <div class="tool-container">
    <el-tabs class="setting-container">
      <el-tab-pane label="假名注音">
        <el-form label-width="auto" v-loading="loading">
          <el-form-item label="输入文本">
            <div class="row">
              <el-input
                size="small"
                v-model="inputText"
                type="textarea"
                clearable
                @clear="onClear"
              ></el-input>
              <el-button
                size="small"
                :disabled="!inputText"
                @click="convertHandler"
                >转换
              </el-button>
            </div>
          </el-form-item>
          <el-form-item label="-">
            <div class="row">
              <el-text v-html="hiraganaResult"></el-text>
              <el-button
                size="small"
                :disabled="!hiraganaResult || isReading"
                @click="ttsOne({ id: hiraganaResult, text: hiraganaResult })"
                >朗读
              </el-button>
            </div>
          </el-form-item>
          <el-form-item label="-">
            <el-text v-html="okuriganaResult"></el-text>
          </el-form-item>
          <el-form-item label="-">
            <el-text
              v-html="toDataRuby(furiganaResult)"
              class="ruby-result-item"
            ></el-text>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="日文朗读">
        <div>
          <el-input
            class="row"
            size="small"
            type="textarea"
            v-model.trim="textToSpeak"
            :autosize="{ minRows: 5, maxRows: 10 }"
            placeholder="请输入需要朗读的 '日文文本'"
          ></el-input>
          <div class="row">
            <el-button
              size="small"
              @click="ttsOne({ id: textToSpeak, text: textToSpeak })"
              :disabled="!textToSpeak || isReading"
              >朗读
            </el-button>
            <el-button
              size="small"
              type="warning"
              @click="speechStore.stop"
              v-if="isReading"
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
      <el-tab-pane label="外部词典">
        <div class="dictionary-pane">
          <el-input
            class="row"
            size="small"
            type="textarea"
            v-model.trim="dictionaryText"
            :autosize="{ minRows: 1, maxRows: 1 }"
            placeholder="输入待查询的字、词、句"
          ></el-input>
          <div class="row">
            <Dictionary :word="dictionaryText" :disabled="!dictionaryText" />
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
import { useReadingStore } from '../../stores/readingStore.ts'
import { useSpeechStore } from '../../stores/speechStore.ts'
import Dictionary from '../../components/Dictionary/Dictionary.vue'
import { storeToRefs } from 'pinia'

const readingStore = useReadingStore()
const { isReading } = storeToRefs(readingStore)

const speechStore = useSpeechStore()
const ttsOne = speechStore.speak

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
  return text?.replace(/<rt>(.*?)<\/rt>/g, '<rt data-ruby="$1"></rt>')
}

const dictionaryText = ref<string>('')
</script>

<style scoped>
.tool-container {
  width: 100%;
  margin: 0 auto;
  max-width: var(--content-max-width);
}

.row {
  width: 100%;
  display: flex;
  gap: var(--gap12);
  justify-content: space-between;
}

.row + .row {
  margin-top: var(--gap12);
}

.speak-button {
  width: 48px;
  box-sizing: border-box;
  flex: none;
}

.ruby-result-item {
  font-size: 1.5rem;
  line-height: 3rem;
}
</style>
