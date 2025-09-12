<template>
  <div class="kanji-tool" v-loading="loading">
    <div class="row">
      <el-input type="textarea" v-model="text"></el-input>
    </div>
    <div class="row">
      <el-button :disabled="!text" @click="convert">转换</el-button>
      <el-button
        :disabled="!hiragana || isReading"
        @click="ttsOne({ id: hiragana, text })"
      >
        朗读
      </el-button>
    </div>
    <div class="result">
      <el-text v-html="hiragana" />
      <el-text v-html="okurigana" />
      <el-text v-html="process(furigana)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { ref } from 'vue'
import ky from 'ky'
import { useReadingStore } from '../../stores/readingStore.ts'
import { useSpeechStore } from '../../stores/speechStore.ts'
import { storeToRefs } from 'pinia'

const readingStore = useReadingStore()
const { isReading } = storeToRefs(readingStore)

const speechStore = useSpeechStore()
const ttsOne = speechStore.speak

const loading = ref(false)
const text = ref('世界の第一位です')
const hiragana = ref('')
const okurigana = ref('')
const furigana = ref('')

// const hiraganaUrl = "https://kuroshiro-vercel.vercel.app/hiragana";
const hiraganaUrl = 'https://kuroshiro.chengshen.me/hiragana'

const convert = async () => {
  if (!text.value) {
    return
  }
  loading.value = true
  try {
    const response = await ky.post(hiraganaUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: text.value,
      }),
      timeout: 15000,
    })
    const data: any = await response.json()

    // hiragana(平假名) → おしごとちゅう
    hiragana.value = data.hiragana
    // furigana(振假名) → お<ruby>仕事<rp>(</rp><rt>しごと</rt><rp>)</rp></ruby><ruby>中<rp>(</rp><rt>ちゅう</rt><rp>)</rp></ruby>
    furigana.value = data.furigana
    // okurigana(送假名) → お仕事(しごと)中(ちゅう)
    okurigana.value = data.okurigana
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

const process = (text: string): string => {
  return text?.replace(/<rt>(.*?)<\/rt>/g, '<rt data-ruby="$1"></rt>')
}
</script>

<style scoped>
.kanji-tool {
  display: flex;
  flex-direction: column;
  gap: var(--gap12);
}

.row {
  width: 100%;
  display: flex;
  gap: var(--gap12);
}

.result {
  display: flex;
  flex-direction: column;
  gap: var(--gap12);
}

.result .el-text {
  width: 100%;
  font-size: 1.2em;
  letter-spacing: 2px;
}
</style>
