<template>
  <div class="tab-pane">
    <div class="row">
      <el-input
        type="textarea"
        v-model.trim="text"
        :autosize="{ minRows: 5 }"
        placeholder="输入待查询的字、词、句"
      />
    </div>

    <div class="row">
      <Dictionary :word="text" :disabled="!text" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Dictionary from '../../components/Dictionary/DictionarySelector.vue'

const text = ref<string>('')
</script>

<style scoped></style>
