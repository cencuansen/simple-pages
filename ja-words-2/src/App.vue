<template>
  <el-container class="container">
    <el-alert
        v-if="!isSupported"
        title="当前浏览器不支持语音合成"
        type="error"
        description="请使用最新版本的 Chrome、Firefox 或 Edge 浏览器。"
        :closable="false"
        style="margin-bottom: 20px;"
    />
    <el-header>
      <el-button
          class="header-item"
          type="primary"
          size="small"
          :disabled="!canGoBack"
          @click="router.go(-1)"
      >
        返回
      </el-button>
      <el-switch
          class="header-item"
          v-model="isDark"
          active-text="🌙"
          inactive-text="☀️"
          size="small"
          @change="toggleDark"
      />
    </el-header>
    <el-main>
      <router-view :key="$route.fullPath"/>
    </el-main>
  </el-container>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useDark, useToggle } from '@vueuse/core'
import { useRouter } from 'vue-router'

const router = useRouter();

const canGoBack = computed(() => window.history.length > 1);

const isDark = useDark();
const toggleDark = useToggle(isDark);

const isSupported = ref(!!speechSynthesis);
</script>

<style scoped>
.container {
  max-width: 768px;
  min-width: 375px;
  margin: 0 auto;
  border-radius: 8px;
}

.el-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.el-header, .el-main {
  padding: 5px;
  overflow: hidden;
}

/* 移动端媒体查询 */
@media (max-width: 768px) {
  .container {
    margin: 0 auto;
    border-radius: 0;
    padding: 0;
  }
}
</style>