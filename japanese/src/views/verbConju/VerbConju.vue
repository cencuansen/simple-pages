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
import { useConjuStore } from '@/stores/conjuStore'
import { storeToRefs } from 'pinia'
import VerbConjuCore from './VerbConjuCore.vue'
import { columns } from '../../constants/verbConju'

const verbConjuStore = useConjuStore()
const { conjuVerbs } = storeToRefs(verbConjuStore)
</script>
