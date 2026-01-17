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
import { baseColumns } from '@/constants/verbConju'
import { useJlptConjuStore } from '@/stores/jlptConjuStore'
import { storeToRefs } from 'pinia'
import VerbConjuCore from './VerbConjuCore.vue'

const jlptVerbConjuStore = useJlptConjuStore()
const { jlptConjuVerbs } = storeToRefs(jlptVerbConjuStore)
</script>
