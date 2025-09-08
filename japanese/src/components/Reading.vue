<template>
  <el-button
    class="speech-button"
    size="small"
    v-if="isAudio"
    circle
    :disabled="isReading"
    @click="play(audioTime)"
  >
    <el-icon>
      <i class="icon-on-music"></i>
    </el-icon>
  </el-button>
  <el-button
    class="speech-button"
    size="small"
    v-else-if="isTts && !isArray"
    circle
    :disabled="isReading"
    @click="tts(item)"
  >
    <el-icon>
      <i class="icon-on-MPIS-TTS"></i>
    </el-icon>
  </el-button>
  <el-button
    class="speech-button"
    size="small"
    v-else-if="isTts && isArray"
    circle
    :disabled="isReading"
    @click="tts2(items)"
  >
    <el-icon>
      <i class="icon-on-MPIS-TTS"></i>
    </el-icon>
  </el-button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useReadingStore } from '../stores/readingStore.ts'
import { useSpeechStore } from '../stores/speechStore.ts'
import { useAudioStore } from '../stores/audioStore.ts'
import { useSettingStore } from '../stores/settingStore.ts'
import { storeToRefs } from 'pinia'
import type { TextBase } from '../views/lesson/types.ts'
import type { WordItem } from '../types'

const readingStore = useReadingStore()
const { isReading } = storeToRefs(readingStore)

const speechStore = useSpeechStore()
const tts = speechStore.speak
const tts2 = speechStore.speakList

const audioStore = useAudioStore()
const play = audioStore.playAudio

const settingStore = useSettingStore()
const { audioSpeak, ttsSpeak } = storeToRefs(settingStore)

const props = defineProps<{
  item?: string | TextBase | WordItem | undefined
  items?: TextBase[] | WordItem[] | undefined
}>()

const audioTime = computed(() => {
  if (isAudio.value) {
    const textbase = props.item as TextBase
    return textbase.time
  }
  return ''
})
const isAudio = computed(() => {
  if (!props.item) {
    return false
  }
  if (typeof props.item === 'string') {
    // 字符串场景是：工具中朗读文本功能
    return false
  }
  return audioSpeak.value && Boolean(props.item.hasOwnProperty('time'))
})
const isTts = computed(() => {
  if (!props.item || !props.items || !props.items.length) {
    return false
  }
  return ttsSpeak
})
const isArray = computed(() => {
  if (props.item || !props.items || !Array.isArray(props.items)) {
    return false
  }
  return Boolean(props.items.length)
})
</script>
<style scoped>
.speech-button {
  margin-bottom: 0.5rem;
}

.speech-button:first-child {
  margin-right: 1rem;
}

.speech-button:last-child {
  margin-left: 1rem;
}
</style>
