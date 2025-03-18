<template>
  <div class="directory-list">
    <el-card
        v-for="item in items"
        :key="item.name"
        class="directory-item"
        shadow="hover"
        @click="navigate(item)"
    >
      {{ item.name }}
    </el-card>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

defineProps({
  items: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['navigate']);

const navigate = (item) => {
  emit('navigate', item);
};
</script>

<style scoped>
.directory-list {
  overflow-y: auto;
  padding-bottom: 90px;
  box-sizing: border-box;
  height: calc(100vh - 80px);
}

.directory-list::-webkit-scrollbar {
  display: none;
}

.directory-item {
  margin-bottom: 10px;
  cursor: pointer;
}
</style>