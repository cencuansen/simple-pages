<template>
  <div class="box">
    <el-input
        class="row"
        v-model="text"
        :rows="15"
        resize="none"
        type="textarea"
        clearable
        :disabled="playing"
        placeholder="输入文本"
    />
    <el-row class="row" v-if="!supported">
      <el-text type="danger">当前浏览器不支持语音合成</el-text>
    </el-row>
    <el-row class="row">
      <el-select
          class="custom-select"
          v-model="opt.lang"
          placeholder="选择语言"
          size="small"
          style="margin-bottom: 10px;"
          :popper-append-to-body="false"
          clearable
          filterable
          :disabled="playing"
          @change="languageChanged"
      >
        <el-option
            v-for="lang in languages"
            :key="lang"
            :label="lang"
            :value="lang"
        />
      </el-select>
    </el-row>
    <el-row class="row">
      <el-select
          class="custom-select"
          v-model="opt.voice"
          placeholder="选择语音"
          size="small"
          style="margin-bottom: 10px;"
          :popper-append-to-body="false"
          clearable
          filterable
          :disabled="playing"
      >
        <el-option
            v-for="voice in voiceView"
            :key="voice.name"
            :label="`${voice.name} | ${voice.lang}`"
            :value="voice.name"
        />
      </el-select>
    </el-row>
    <el-row class="row slide-row">
      <div class="slide-label">速率</div>
      <div class="slide">
        <el-slider v-model="opt.rate" :min="0.1" :max="2" :step="0.1" show-stops :disabled="playing"/>
      </div>
    </el-row>
    <el-row class="row slide-row">
      <div class="slide-label">音调</div>
      <div class="slide">
        <el-slider v-model="opt.pitch" :min="0" :max="2" :step="0.1" show-stops :disabled="playing"/>
      </div>
    </el-row>
    <el-row class="row slide-row">
      <div class="slide-label">音量</div>
      <div class="slide">
        <el-slider v-model="opt.volume" :min="0" :max="1" :step="0.1" show-stops :disabled="playing"/>
      </div>
    </el-row>
    <el-row class="row">
      <el-button type="primary" @click="play" :disabled="!text || playing">播放</el-button>
      <el-button type="primary" @click="tts.pause" :disabled="!text || !playing">暂停</el-button>
      <el-button type="primary" @click="tts.resume" :disabled="!text || !playing">恢复</el-button>
      <el-button type="danger" @click="tts.cancel" :disabled="!text || !playing">重置</el-button>
    </el-row>
    <el-row class="row">
      <el-button type="primary" @click="trim" :disabled="!text || playing">压缩</el-button>
      <el-button type="primary" @click="clear" :disabled="!text || playing">清空</el-button>
      <el-button type="primary" @click="toggleDark()">{{ isDark ? '浅色' : '深色' }}</el-button>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import {ElMessage} from "element-plus";
import {ref, computed} from 'vue'
import {useDark, useToggle} from '@vueuse/core'
import type {Options} from "../public/javascript/def.ts";
import tts from '../public/javascript/tts.ts'

const isDark = useDark()
const toggleDark = useToggle(isDark)

const supported = ref(tts.isSupported)

const text = ref()
const languages = ref<string[]>([])
const voices = ref<SpeechSynthesisVoice[]>([])
const opt = ref<Options>({
  volume: 1,
  rate: 1,
  pitch: 1
});
const playing = ref(false);

const voiceView = computed(() => {
  if (!opt.value.lang) {
    return voices.value;
  }
  return voices.value.filter(x => x.lang === opt.value.lang)
})

tts.onStart(() => {

})

tts.onEnd(() => {
  playing.value = false
})

tts.onError(() => {
  playing.value = false
})

function play() {
  if (!text.value) {
    ElMessage.error('请输入文本');
    return;
  }
  playing.value = true
  tts.speak(text.value, opt.value);
}

function trim() {
  text.value = text.value?.split('\n').map((line: string) => line.trim()).filter(Boolean).join('\n');
}

function clear() {
  text.value = null
}

function languageChanged() {
  opt.value.voice = '';
}

let getLanguageStart = new Date();
let languageTimer = setInterval(() => {
  if (voices.value.length > 0) {
    clearInterval(languageTimer)
    return;
  }
  if (new Date().getTime() - getLanguageStart.getTime() > 5000) {
    clearInterval(languageTimer)
    return;
  }
  languages.value = tts.getLanguages();
}, 1000);

let getVoiceStart = new Date();
let voiceTimer = setInterval(() => {
  if (voices.value.length > 0) {
    clearInterval(voiceTimer)
    return;
  }
  if (new Date().getTime() - getVoiceStart.getTime() > 5000) {
    clearInterval(voiceTimer)
    return;
  }
  voices.value = tts.getVoices();
}, 1000);

</script>

<style scoped>
.box {
  margin: 5px;
  overflow: hidden;
}

.row {
  margin-bottom: 10px;
}

.row:last-child {
  margin-bottom: 0;
}

:deep(textarea) {
  width: 100%;
  padding: 10px;
  font-size: 1rem;
}

:deep(.el-select__wrapper) {
  height: 35px;
}

:deep(.el-select) {
  margin-bottom: 0 !important;
}

.slide-row {
  display: flex;
  align-items: center;
}

.slide-label {
  width: 30px;
  text-align: right;
}

.slide {
  width: calc(100% - 45px);
  margin-left: 15px;
}
</style>
