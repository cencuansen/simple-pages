<template>
  <el-button
    class="speech-button"
    size="small"
    v-if="isAudio"
    circle
    :disabled="isReading"
    @click="audioOne(audioTime)"
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
    @click="ttsOne(tts)"
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
    @click="ttsMany(items)"
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
import type { Article, Discussion, TextBase } from '../views/lesson/types.ts'
import type { WordItem } from '../types'

const readingStore = useReadingStore()
const { isReading } = storeToRefs(readingStore)

const speechStore = useSpeechStore()
const ttsOne = speechStore.speak
const ttsMany = speechStore.speakList

const audioStore = useAudioStore()
const audioOne = audioStore.playAudio

const settingStore = useSettingStore()
const { audioSpeak, ttsSpeak } = storeToRefs(settingStore)

const props = defineProps<{
  item?: string | Discussion | Article | TextBase | WordItem | undefined
  items?: TextBase[] | WordItem[] | undefined
}>()

const audioTime = computed(() => {
  if (isAudio.value) {
    const textbase = props.item as Discussion | Article | TextBase
    return textbase.time
  }
  return ''
})
const tts = computed(() => {
  return props.item as string | TextBase | WordItem | undefined
})
const isAudio = computed(() => {
  if (!props.item) {
    return false
  }
  if (typeof props.item === 'string') {
    // 字符串场景是：工具中朗读文本功能
    return false
  }
  return (
    audioSpeak.value &&
    props.item.hasOwnProperty('time') &&
    Boolean((props.item as Discussion | Article | TextBase)['time'])
  )
})
const isTts = computed(() => {
  return !isAudio.value && ttsSpeak
})
const isArray = computed(() => {
  if (!props.items) {
    return false
  }
  return Boolean((props.items as []).length)
})
</script>
<style scoped>

</style>
