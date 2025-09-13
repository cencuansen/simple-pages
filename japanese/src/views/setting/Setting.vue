<template>
  <div class="setting">
    <el-tabs tab-position="top">
      <el-tab-pane label="通用">
        <GeneralSetting />
      </el-tab-pane>
      <el-tab-pane label="语音">
        <TtsSetting />
      </el-tab-pane>
      <el-tab-pane label="VoiceVox">
        <VoiceVoxSetting />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import GeneralSetting from './GeneralSetting.vue'
import TtsSetting from './TtsSetting.vue'
import VoiceVoxSetting from './VoiceVoxSetting.vue'
</script>

<style scoped>
.setting {
  width: 100%;
  overflow-y: scroll;
}

.el-tabs {
  margin: 0 auto;
  max-width: var(--content-max-width);
  height: calc(100vh - var(--root-header-height) - var(--root-footer-height));
}

:deep(.el-tabs__content) {
  /* 让 tabs 子项可滚动 */
  overflow-y: auto;
}

:deep(.el-tabs__content::-webkit-scrollbar) {
  display: none;
}
</style>
