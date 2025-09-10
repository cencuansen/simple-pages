<template>
  <!-- 纯文本 -->
  <IconBot
    class="icon 纯文本-tts"
    :class="{ disabled: isReading }"
    v-if="ttsText"
    @click="ttsOne({ id: ttsText, text: ttsText })"
  />

  <!-- 课文行 一行 -->
  <IconVoice
    class="icon 单课文行-audio"
    :class="{ disabled: isReading }"
    v-else-if="rowItem?.audio"
    @click="audioOne({ id: rowItem.textId, text: rowItem.audio })"
  />

  <IconBot
    class="icon 单课文行-tts-audio"
    :data="rowItem?.ttsAudio"
    :class="{ disabled: isReading }"
    v-else-if="rowItem?.ttsAudio"
    @click="audioOne({ id: rowItem.textId, text: rowItem.ttsAudio })"
  />

  <IconBot
    class="icon 单课文行-tts"
    :class="{ disabled: isReading }"
    v-else-if="rowItem?.speakText"
    @click="ttsOne({ id: rowItem.textId, text: rowItem.speakText })"
  />

  <!-- 课文行 多行 -->
  <IconVoice
    class="icon 多课文行-audio"
    :class="{ disabled: isReading }"
    v-else-if="rowItems && rowItems[0].audio"
    @click="
      audioMany(
        rowItems.map((item) => ({ id: item.textId, text: item.audio || '' }))
      )
    "
  />

  <IconBot
    class="icon 多课文行-tts-audio"
    :class="{ disabled: isReading }"
    v-else-if="rowItems && rowItems[0].ttsAudio"
    @click="
      audioMany(
        rowItems.map((item) => ({ id: item.textId, text: item.ttsAudio || '' }))
      )
    "
  />

  <IconBot
    class="icon 多课文行-tts"
    :class="{ disabled: isReading }"
    v-else-if="rowItems && rowItems[0].speakText"
    @click="
      ttsMany(
        rowItems.map((item) => ({ id: item.textId, text: item.speakText }))
      )
    "
  />

  <!--单词 单个-->
  <IconVoice
    class="icon 单单词-audio"
    :class="{ disabled: isReading }"
    v-else-if="word?.audio"
    @click="audioOne({ id: word.textId, text: word.audio })"
  />

  <IconBot
    class="icon 单单词-tts-audio"
    :class="{ disabled: isReading }"
    v-else-if="word?.ttsAudio"
    @click="audioOne({ id: word.textId, text: word.ttsAudio })"
  />

  <IconBot
    class="icon 单单词-tts"
    :class="{ disabled: isReading }"
    v-else-if="word?.kana"
    @click="ttsOne({ id: word.textId, text: word.kana })"
  />

  <!--单词 多个-->
  <IconVoice
    class="icon 多单词-audio"
    :class="{ disabled: isReading }"
    v-else-if="words && words[0]?.audio"
    @click="
      audioMany(
        words.map((item) => ({ id: item.textId, text: item.audio || '' }))
      )
    "
  />

  <IconBot
    class="icon 多单词-tts-audio"
    :class="{ disabled: isReading }"
    v-else-if="words && words[0]?.ttsAudio"
    @click="
      audioMany(
        words.map((item) => ({ id: item.textId, text: item.ttsAudio || '' }))
      )
    "
  />

  <IconBot
    class="icon 多单词-tts"
    :class="{ disabled: isReading }"
    v-else-if="words && words[0]?.kana"
    @click="
      ttsMany(words.map((item) => ({ id: item.textId, text: item.kana })))
    "
  />
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useReadingStore } from '../stores/readingStore.ts'
import { useSpeechStore } from '../stores/speechStore.ts'
import { useAudioStore } from '../stores/audioStore.ts'
import { storeToRefs } from 'pinia'
import type { TextBase } from '../views/lesson/types.ts'
import type { WordItem } from '../types'
import IconVoice from './IconVoice.vue'
import IconBot from './IconBot.vue'

const readingStore = useReadingStore()
const { isReading, nowTextId } = storeToRefs(readingStore)

const speechStore = useSpeechStore()
const { lastFireTime } = storeToRefs(speechStore)
const ttsOne = speechStore.speak
const ttsMany = speechStore.speakList

const audioStore = useAudioStore()
const audioOne = audioStore.playAudio
const audioMany = audioStore.playAudioList

const props = defineProps<{
  ttsText?: string | undefined | null
  rowItem?: TextBase | undefined | null
  rowItems?: TextBase[] | undefined | null
  word?: WordItem | undefined | null
  words?: WordItem[] | undefined | null
}>()

watch(
  () => lastFireTime.value,
  (_) => {
    document.getElementById(nowTextId.value)?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
    })
  }
)

watch(() => props.ttsText, () => {
  console.log('props.ttsText', props.ttsText)
})
</script>

<style></style>

<style scoped>
.icon {
  font-size: 18px;
  cursor: pointer;
  color: #63a35c;
}

.disabled {
  color: #666;
  cursor: not-allowed;
}
</style>
