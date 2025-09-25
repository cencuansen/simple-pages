<template>
  <div class="tool-container">
    <el-tabs class="setting-container">
      <el-tab-pane label="注音">
        <KanjiTool />
      </el-tab-pane>
      <el-tab-pane label="朗读">
        <TtsTool />
      </el-tab-pane>
      <el-tab-pane label="词典">
        <DictTool />
      </el-tab-pane>
      <el-tab-pane label="音调">
        <AccentTool />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import KanjiTool from './KanjiTool.vue'
import TtsTool from './TtsTool.vue'
import DictTool from './DictTool.vue'
import AccentTool from './AccentTool.vue'
</script>

<style scoped>
.tool-container {
  width: 100%;
  overflow-y: scroll;
}

.tab-pane {
  display: flex;
  flex-direction: column;
  gap: var(--gap12);
}

:deep(.row) {
  width: 100%;
  display: flex;
  gap: var(--gap12);
}

.el-tabs {
  height: calc(100vh - var(--root-header-height) - var(--root-footer-height));
}

:deep(.el-tab-pane) {
  width: 100%;
  margin: 0 auto;
  max-width: var(--content-max-width);
}

:deep(.el-tabs__content) {
  /* 让 tabs 子项可滚动 */
  overflow-y: auto;
}

:deep(.el-tabs__content::-webkit-scrollbar) {
  display: none;
}

:deep(.el-tabs__header.is-top) {
  width: 100%;
  margin: 0 auto 15px;
  max-width: var(--content-max-width);
}
</style>
