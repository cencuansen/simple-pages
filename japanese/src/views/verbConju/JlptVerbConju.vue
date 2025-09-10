<template>
  <VerbConjuCore
    :data="jlptConjuVerbs"
    type-select
    transitivity-select
    keyword-filter
  />
</template>

<script setup lang="ts">
import { useJlptConjuStore } from '../../stores/jlptConjuStore.ts'
import { storeToRefs } from 'pinia'
import VerbConjuCore from './VerbConjuCore.vue'

const jlptVerbConjuStore = useJlptConjuStore()
const { jlptConjuVerbs } = storeToRefs(jlptVerbConjuStore)
</script>
