<template>
  <VerbConjuCore
    :data="jlptConjuVerbs"
    :columns="baseColumns"
    type-select
    transitivity-select
    keyword-filter
    :page-size="20"
  />
</template>

<script setup lang="ts">
import { baseColumns } from './index.ts'
import { useJlptConjuStore } from '@/stores/jlptConjuStore.ts'
import { storeToRefs } from 'pinia'
import VerbConjuCore from './VerbConjuCore.vue'

const jlptVerbConjuStore = useJlptConjuStore()
const { jlptConjuVerbs } = storeToRefs(jlptVerbConjuStore)
</script>
