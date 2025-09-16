<template>
  <VerbConjuCore
    :data="conjuVerbs"
    :columns="columns"
    lesson-select
    type-select
    transitivity-select
    keyword-filter
    :page-size="20"
  />
</template>

<script setup lang="ts">
import { useConjuStore } from '@/stores/conjuStore.ts'
import { storeToRefs } from 'pinia'
import VerbConjuCore from './VerbConjuCore.vue'
import { columns } from '../../constants/verbConju.ts'

const verbConjuStore = useConjuStore()
const { conjuVerbs } = storeToRefs(verbConjuStore)
</script>
