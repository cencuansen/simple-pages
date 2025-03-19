<template>
  <el-row class="word-list-header-row" :gutter="20">
    <el-col :span="8" class="op-col op-switch-col">
      <span class="col-label">单词</span>
      <el-switch v-model="showWord" size="small"/>
    </el-col>
    <el-col :span="8" class="op-col op-switch-col">
      <span class="col-label">注音</span>
      <el-switch v-model="showKana" size="small"/>
    </el-col>
    <el-col :span="8" class="op-col op-switch-col">
      <span class="col-label">释义</span>
      <el-switch v-model="showMeaning" size="small"/>
    </el-col>
  </el-row>
  <el-row class="word-list-header-row" :gutter="20">
    <el-col :span="8" class="op-col op-select-col">
      <el-select
          v-model="currentVoiceName"
          :placeholder="placeHolder"
          size="small"
          :popper-append-to-body="false"
          clearable
          filterable
          @change="updateVoice"
      >
        <el-option
            v-for="voice in voices"
            :key="voice.name"
            :label="`${ voice.name } | ${ voice.lang }`"
            :value="voice.name"
        />
      </el-select>
    </el-col>
    <el-col :span="8" class="op-col op-switch-col">
      <span class="col-label col-icon">
        慢速
        <el-tooltip effect="dark" :content="`${slowRate}x`" placement="top">
          <el-icon><InfoFilled/></el-icon>
        </el-tooltip>
      </span>
      <el-switch v-model="slowMode" size="small"/>
    </el-col>
    <el-col :span="8" class="op-col op-switch-col">
      <span class="col-label col-icon">
        重复
        <el-tooltip effect="dark" :content="`${repeatTimes}次`" placement="top">
          <el-icon><InfoFilled/></el-icon>
        </el-tooltip>
      </span>
      <el-switch v-model="repeatMode" size="small"/>
    </el-col>
  </el-row>
  <div class="word-list">
    <el-card
        v-for="word in words"
        :key="word.word"
        class="word-item"
        shadow="hover"
    >
      <el-row :gutter="10" align="middle" class="word-row">
        <el-col :span="13" class="word-col">
          <div class="word-text">{{ showWord ? word.word : '****' }}</div>
          <div class="word-kana" v-if="word.kana">{{ showKana ? word.kana : '****' }}</div>
        </el-col>
        <el-col :span="9" class="meaning-col">
          <div class="word-meaning">{{ showMeaning ? word.meaning : '****' }}</div>
        </el-col>
        <el-col :span="2" class="button-col speak-button" v-if="isSupported">
          <el-button
              type="primary"
              circle
              :disabled="speakDisabled"
              @click="speakWords(word.kana)">
            <el-icon>
              <VideoPlay/>
            </el-icon>
          </el-button>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue';
import {VideoPlay} from '@element-plus/icons-vue';
import {ElMessage} from 'element-plus'
import {useRouter} from 'vue-router'

const router = useRouter()

const words = ref<any[]>([])

// 加载单词数据
const loadWords = async () => {
  try {
    const paramDir = router.currentRoute.value.params.dir
    const paramLesson = router.currentRoute.value.params.lesson

    const dirsRes = await fetch('/directory.json')
    const data = await dirsRes.json()
    const directories = data.children

    const lessons = directories.filter((d: any) => d.name === paramDir)[0].children
    const lesson = lessons.filter((d: any) => d.name === paramLesson)[0]

    const response = await fetch(lesson.path)
    words.value = await response.json()
    console.log('words.value', words.value)
  } catch (error) {
    console.error('加载单词列表失败:', error)
  }
}

onMounted(async () => {
  await loadWords()
})

let currentLanguage: string = 'ja-JP';
let currentVoice: SpeechSynthesisVoice | null = null;
const showWord = ref<boolean>(true);
const showKana = ref<boolean>(true);
const showMeaning = ref<boolean>(true);
const slowMode = ref<boolean>(false);
const slowRate = ref<number>(0.5);
const repeatMode = ref<boolean>(false);
const repeatTimes = ref<number>(3);
const isSupported = !!speechSynthesis;
const speakDisabled = ref<boolean>(false);
const placeHolder = ref<string | null | undefined>('加载中');
const voices = ref<SpeechSynthesisVoice[]>([]);
const currentVoiceName = ref<string>('');
const japaneseFilter = (x: SpeechSynthesisVoice) => x.lang.indexOf('ja') > -1 && x.lang.indexOf('JP') > -1;

const loadVoices = () => {
  voices.value = speechSynthesis.getVoices().filter(japaneseFilter);
  if (voices.value.length === 0) {
    return;
  }
  const currentVoiceCache = localStorage.getItem('currentVoiceName');
  const selectedVoices = voices.value.filter(v => v.name === currentVoiceCache);
  if (selectedVoices.length > 0) {
    currentVoice = selectedVoices[0];
  } else {
    currentVoice = voices.value[0]
    localStorage.setItem('currentVoiceName', currentVoiceName.value);
  }
  currentLanguage = currentVoice.lang;
  currentVoiceName.value = currentVoice.name;
};

const updateVoice = (voiceName: string) => {
  currentVoice = voices.value.find(voice => voice.name === voiceName) || null;
  currentLanguage = currentVoice?.lang || '';
  localStorage.setItem('currentVoiceName', voiceName);
};

if (isSupported) {
  let start = new Date();
  let timer = setInterval(() => {
    if (voices.value.length > 0) {
      clearInterval(timer);
      placeHolder.value = null;
      return;
    }
    if (new Date().getTime() - start.getTime() > 5000) {
      clearInterval(timer);
      placeHolder.value = null;
      return;
    }
    loadVoices();
  }, 1000)
}

function onend() {
  speakDisabled.value = false;
}

function onerror() {
  speakDisabled.value = false;
  ElMessage.error('错误')
}

function tryRepeat(utterance: SpeechSynthesisUtterance, maxTimes: number, currentTimes: number) {
  if (currentTimes < maxTimes) {
    utterance.onend = () => {
      currentTimes = currentTimes + 1;
      tryRepeat(utterance, maxTimes, currentTimes);
    };
  } else {
    utterance.onend = onend;
  }
  speechSynthesis.speak(utterance);
}

const speakWords = (word: string | undefined) => {
  if (!speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.rate = slowMode.value ? slowRate.value : 1;
  utterance.pitch = 1;
  utterance.lang = currentLanguage;
  utterance.voice = currentVoice;
  utterance.onerror = onerror;
  speakDisabled.value = true;
  utterance.onend = onend;

  if (repeatMode.value) {
    tryRepeat(utterance, repeatTimes.value, 1);
  } else {
    speechSynthesis.speak(utterance);
  }
};

</script>

<style scoped>
.word-list-header-row {
  margin-bottom: 10px;
}

.op-col {
  display: flex;
  align-items: center;
  justify-content: start;
}

.col-label {
  font-size: 16px;
  margin-right: 5px;
}

.col-icon {
  display: flex;
  align-items: center;
}

.word-item {
  margin-bottom: 10px;
}

.word-item:nth-last-child {
  margin-bottom: 0;
}

.word-text {
  font-size: 20px;
}

.word-kana {
  font-size: 12px;
  margin-top: 2px;
}

.word-meaning {
  font-size: 20px;
}

.speak-button {
  display: flex;
  user-select: none;
  justify-content: center;
}

.speak-button .el-button {
  width: 25px;
  height: 25px;
}

.word-list {
  overflow-y: auto;
  padding-bottom: 90px;
  box-sizing: border-box;
  height: calc(100vh - 150px);
}

.word-list::-webkit-scrollbar {
  display: none;
}

/* 移动端媒体查询 */
@media (max-width: 768px) {
  .el-card {
    padding: 0;
  }

  :deep(.el-card__body) {
    padding: 5px; /* 移动端减少 padding */
  }

  .col-label {
    font-size: 12px;
  }

  .word-list {
    height: calc(100vh - 150px);
  }

  .word-text {
    font-size: 15px;
  }

  .word-kana {
    font-size: 10px;
  }

  .word-meaning {
    font-size: 15px;
  }
}
</style>