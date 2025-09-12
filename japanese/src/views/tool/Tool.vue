<template>
  <div class="tool-container">
    <el-tabs class="setting-container">
      <el-tab-pane label="假名注音">
        <KanjiTool />
      </el-tab-pane>
      <el-tab-pane label="日文朗读">
        <TtsTool />
      </el-tab-pane>
      <el-tab-pane label="外部词典">
        <DictTool />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import KanjiTool from './KanjiTool.vue'
import TtsTool from './TtsTool.vue'
import DictTool from './DictTool.vue'
</script>

<style scoped>
.tool-container {
  width: 100%;
  margin: 0 auto;
  max-width: var(--content-max-width);
}

.tool {
  display: flex;
  flex-direction: column;
  gap: var(--gap12);
}

.row {
  width: 100%;
  display: flex;
  gap: var(--gap12);
}
</style>
