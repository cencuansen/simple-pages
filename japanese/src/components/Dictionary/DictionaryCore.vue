<template>
  <a
    class="now-dict"
    target="_blank"
    :href="toUrl(props.word, props.dict)"
    :title="props.dict.name"
  >
    <img
      class="now-dict-img"
      v-if="props.dict.logo"
      :src="props.dict.logo"
      :alt="props.dict.name"
    />
    <span class="now-dict-label" v-else>{{ props.dict.label }}</span>
  </a>
</template>

<script setup lang="ts">
import type { DictionaryCore } from '@/types/dictionary'
import { toUrl } from '@/utils/dictionary'

const props = defineProps<DictionaryCore>()
</script>

<style scoped>
.now-dict {
  height: 100%;
  aspect-ratio: 1 / 1;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.now-dict-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background-position: 100% 100%;
}

.now-dict-label {
  position: absolute;
  left: 0;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
