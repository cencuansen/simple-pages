<template>
  <el-tabs class="setting-container" tab-position="top">
    <el-tab-pane label="通用">
      <GeneralSetting />
    </el-tab-pane>
    <el-tab-pane label="语音">
      <TtsSetting />
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
import GeneralSetting from './GeneralSetting.vue'
import TtsSetting from './TtsSetting.vue'
</script>

<style scoped>
.setting-container {
  width: 100%;
  margin: 0 auto;
  max-width: var(--content-max-width);
}
</style>
