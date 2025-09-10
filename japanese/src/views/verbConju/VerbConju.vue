<template>
  <VerbConjuCore
    :data="conjuVerbs"
    :columns="columns"
    lesson-select
    type-select
    transitivity-select
    keyword-filter
  />
</template>

<script setup lang="ts">
import { useConjuStore } from '../../stores/conjuStore.ts'
import { storeToRefs } from 'pinia'
import VerbConjuCore from './VerbConjuCore.vue'
import { columns } from './index.ts'

const verbConjuStore = useConjuStore()
const { conjuVerbs } = storeToRefs(verbConjuStore)
</script>
