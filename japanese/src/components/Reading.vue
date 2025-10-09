<template>
  <component
    class="icon"
    v-if="iconConfig"
    :is="iconConfig.component"
    :class="iconConfig.className"
    :disabled="isReading"
    :tabindex="isReading ? -1 : 0"
    v-bind="iconConfig.extraProps"
    @click="iconConfig.onClick"
    @keydown.space="handleKeydown"
    @keydown.enter="handleKeydown"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useReadingStore } from '../stores/readingStore'
import { useSpeechStore } from '../stores/speechStore'
import { useAudioStore } from '../stores/audioStore'
import { useSettingStore } from '../stores/settingStore'
import { useVoiceVoxStore } from '../stores/voiceVox/voiceVoxStore'
import type { TextBase } from '../types/lesson'
import type { WordItem } from '@/types/word'
import IconVoice from './IconVoice.vue'
import IconBot from './IconBot.vue'
import IconVoiceVox from './IconVoiceVox.vue'

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

const voiceVoxStore = useVoiceVoxStore()
const { usable: voiceVoxUsable } = storeToRefs(voiceVoxStore)
const setAudioRef = voiceVoxStore.setAudioRef
const voiceVoxOne = voiceVoxStore.voiceVoxOne
const voiceVoxList = voiceVoxStore.voiceVoxList

const iconConfig = computed(() => {
  // 纯文本
  if (ttsSpeak.value && props.ttsText) {
    return {
      component: IconBot,
      className: '纯文本-tts',
      onClick: () => ttsOne({ id: props.ttsText!, text: props.ttsText! }),
    }
  }

  // 课文行 - 单行
  if (audioSpeak.value && props.rowItem?.audio) {
    return {
      component: IconVoice,
      className: '单课文行-audio',
      onClick: () =>
        audioOne({
          id: props.rowItem!.textId,
          text: props.rowItem!.audio || '',
        }),
    }
  } else if (audioSpeak.value && props.rowItem?.ttsAudio) {
    return {
      component: IconVoiceVox,
      className: '单课文行-tts-audio',
      extraProps: { data: props.rowItem.ttsAudio },
      onClick: () =>
        audioOne({ id: props.rowItem!.textId, text: props.rowItem!.ttsAudio! }),
    }
  } else if (voiceVoxUsable.value && props.rowItem?.speakText) {
    return {
      component: IconVoiceVox,
      className: '单课文行-voicevox-tts-audio',
      extraProps: { data: props.rowItem.speakText },
      onClick: () =>
        voiceVoxOne({
          id: props.rowItem!.textId,
          text: props.rowItem!.speakText!,
        }),
    }
  } else if (ttsSpeak.value && props.rowItem?.speakText) {
    return {
      component: IconBot,
      className: '单课文行-tts',
      onClick: () =>
        ttsOne({ id: props.rowItem!.textId, text: props.rowItem!.speakText! }),
    }
  }

  // 课文行 - 多行
  if (audioSpeak.value && props.rowItems?.[0]?.audio) {
    return {
      component: IconVoice,
      className: '多课文行-audio',
      onClick: () =>
        audioMany(
          props.rowItems!.map((i) => ({ id: i.textId, text: i.audio || '' }))
        ),
    }
  } else if (audioSpeak.value && props.rowItems?.[0]?.ttsAudio) {
    return {
      component: IconVoiceVox,
      className: '多课文行-tts-audio',
      onClick: () =>
        audioMany(
          props.rowItems!.map((i) => ({ id: i.textId, text: i.ttsAudio || '' }))
        ),
    }
  } else if (voiceVoxUsable.value && props.rowItems?.[0]?.speakText) {
    return {
      component: IconVoiceVox,
      className: '多课文行-voicevox-tts-audio',
      onClick: () =>
        voiceVoxList(
          props.rowItems!.map((i) => ({ id: i.textId, text: i.speakText }))
        ),
    }
  } else if (ttsSpeak.value && props.rowItems?.[0]?.speakText) {
    return {
      component: IconBot,
      className: '多课文行-tts',
      onClick: () =>
        ttsMany(
          props.rowItems!.map((i) => ({ id: i.textId, text: i.speakText }))
        ),
    }
  }

  // 单词 - 单个
  if (audioSpeak.value && props.word?.audio) {
    return {
      component: IconVoice,
      className: '单单词-audio',
      onClick: () =>
        audioOne({ id: props.word!.textId, text: props.word!.audio || '' }),
    }
  } else if (audioSpeak.value && props.word?.ttsAudio) {
    return {
      component: IconVoiceVox,
      className: '单单词-tts-audio',
      onClick: () =>
        audioOne({ id: props.word!.textId, text: props.word!.ttsAudio! }),
    }
  } else if (voiceVoxUsable.value && props.word?.word) {
    return {
      component: IconVoiceVox,
      className: '单单词-voicevox-tts-audio',
      onClick: () =>
        voiceVoxOne({ id: props.word!.textId, text: props.word!.word }),
    }
  } else if (ttsSpeak.value && props.word?.word) {
    return {
      component: IconBot,
      className: '单单词-tts',
      onClick: () => ttsOne({ id: props.word!.textId, text: props.word!.word }),
    }
  }

  // 单词 - 多个
  if (audioSpeak.value && props.words?.[0]?.audio) {
    return {
      component: IconVoice,
      className: '多单词-audio',
      onClick: () =>
        audioMany(
          props.words!.map((i) => ({ id: i.textId, text: i.audio || '' }))
        ),
    }
  } else if (audioSpeak.value && props.words?.[0]?.ttsAudio) {
    return {
      component: IconVoiceVox,
      className: '多单词-tts-audio',
      onClick: () =>
        audioMany(
          props.words!.map((i) => ({ id: i.textId, text: i.ttsAudio || '' }))
        ),
    }
  } else if (voiceVoxUsable.value && props.words?.[0]?.word) {
    return {
      component: IconVoiceVox,
      className: '多单词-voicevox-tts-audio',
      onClick: () =>
        voiceVoxList(props.words!.map((i) => ({ id: i.textId, text: i.word }))),
    }
  } else if (ttsSpeak.value && props.words?.[0]?.word) {
    return {
      component: IconBot,
      className: '多单词-tts',
      onClick: () =>
        ttsMany(props.words!.map((i) => ({ id: i.textId, text: i.word }))),
    }
  }

  return null
})

function handleKeydown(event: Event) {
  // 阻止空格键的默认滚动行为
  event.preventDefault()

  // 模拟点击事件
  if (!isReading.value) {
    iconConfig.value?.onClick()
  }
}

// 滚动监听
watch(
  () => lastFireTime.value,
  () => {
    document.getElementById(nowTextId.value)?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
    })
  }
)

const createUniqueAudio = (): HTMLAudioElement => {
  const id = 'voicevox-audio'
  let audio = document.getElementById(id)
  if (audio) {
    return audio as HTMLAudioElement
  }
  audio = document.createElement('audio')
  audio.id = id
  document.body.appendChild(audio)
  return audio as HTMLAudioElement
}

onMounted(() => {
  setAudioRef(createUniqueAudio())
})
</script>

<style scoped>
.icon:hover {
  border-radius: 3px;
  background-color: var(--el-fill-color-darker);
}
</style>
