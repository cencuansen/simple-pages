<template>
  <component v-if="iconConfig" :is="iconConfig.component" class="icon" :class="iconConfig.className"
    :disabled="isReading" v-bind="iconConfig.extraProps" @click="iconConfig.onClick" />
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useReadingStore } from '../stores/readingStore'
import { useSpeechStore } from '../stores/speechStore'
import { useAudioStore } from '../stores/audioStore'
import { useSettingStore } from '../stores/settingStore'
import type { TextBase } from '../views/lesson/types'
import type { WordItem } from '../types'
import IconVoice from './IconVoice.vue'
import IconBot from './IconBot.vue'

const props = defineProps<{
  ttsText?: string | null
  rowItem?: TextBase | null
  rowItems?: TextBase[] | null
  word?: WordItem | null
  words?: WordItem[] | null
}>()

// store
const { isReading, nowTextId } = storeToRefs(useReadingStore())
const speechStore = useSpeechStore()
const { lastFireTime } = storeToRefs(speechStore)
const ttsOne = speechStore.speak
const ttsMany = speechStore.speakList

const audioStore = useAudioStore()
const audioOne = audioStore.playAudio
const audioMany = audioStore.playAudioList

const { audioSpeak, ttsSpeak } = storeToRefs(useSettingStore())

// 计算属性：决定渲染哪个图标
const iconConfig = computed(() => {
  // 纯文本
  if (ttsSpeak.value && props.ttsText) {
    return {
      component: IconBot,
      className: '纯文本-tts',
      onClick: () => ttsOne({ id: props.ttsText!, text: props.ttsText! })
    }
  }

  // 课文行 - 单行
  if (audioSpeak.value && props.rowItem?.audio) {
    return {
      component: IconVoice,
      className: '单课文行-audio',
      onClick: () => audioOne({ id: props.rowItem!.textId, text: props.rowItem!.audio || '' })
    }
  }
  if (audioSpeak.value && props.rowItem?.ttsAudio) {
    return {
      component: IconBot,
      className: '单课文行-tts-audio',
      extraProps: { data: props.rowItem.ttsAudio },
      onClick: () => audioOne({ id: props.rowItem!.textId, text: props.rowItem!.ttsAudio! })
    }
  }
  if (ttsSpeak.value && props.rowItem?.speakText) {
    return {
      component: IconBot,
      className: '单课文行-tts',
      onClick: () => ttsOne({ id: props.rowItem!.textId, text: props.rowItem!.speakText! })
    }
  }

  // 课文行 - 多行
  if (audioSpeak.value && props.rowItems?.[0]?.audio) {
    return {
      component: IconVoice,
      className: '多课文行-audio',
      onClick: () => audioMany(props.rowItems!.map(i => ({ id: i.textId, text: i.audio || '' })))
    }
  }
  if (audioSpeak.value && props.rowItems?.[0]?.ttsAudio) {
    return {
      component: IconBot,
      className: '多课文行-tts-audio',
      onClick: () => audioMany(props.rowItems!.map(i => ({ id: i.textId, text: i.ttsAudio || '' })))
    }
  }
  if (ttsSpeak.value && props.rowItems?.[0]?.speakText) {
    return {
      component: IconBot,
      className: '多课文行-tts',
      onClick: () => ttsMany(props.rowItems!.map(i => ({ id: i.textId, text: i.speakText })))
    }
  }

  // 单词 - 单个
  if (audioSpeak.value && props.word?.audio) {
    return {
      component: IconVoice,
      className: '单单词-audio',
      onClick: () => audioOne({ id: props.word!.textId, text: props.word!.audio || ''})
    }
  }
  if (audioSpeak.value && props.word?.ttsAudio) {
    return {
      component: IconBot,
      className: '单单词-tts-audio',
      onClick: () => audioOne({ id: props.word!.textId, text: props.word!.ttsAudio! })
    }
  }
  if (ttsSpeak.value && props.word?.kana) {
    return {
      component: IconBot,
      className: '单单词-tts',
      onClick: () => ttsOne({ id: props.word!.textId, text: props.word!.word })
    }
  }

  // 单词 - 多个
  if (audioSpeak.value && props.words?.[0]?.audio) {
    return {
      component: IconVoice,
      className: '多单词-audio',
      onClick: () => audioMany(props.words!.map(i => ({ id: i.textId, text: i.audio || '' })))
    }
  }
  if (audioSpeak.value && props.words?.[0]?.ttsAudio) {
    return {
      component: IconBot,
      className: '多单词-tts-audio',
      onClick: () => audioMany(props.words!.map(i => ({ id: i.textId, text: i.ttsAudio || '' })))
    }
  }
  if (ttsSpeak.value && props.words?.[0]?.kana) {
    return {
      component: IconBot,
      className: '多单词-tts',
      onClick: () => ttsMany(props.words!.map(i => ({ id: i.textId, text: i.kana })))
    }
  }

  return null
})

// 滚动监听
watch(
  () => lastFireTime.value,
  () => {
    document.getElementById(nowTextId.value)?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest'
    })
  }
)
</script>