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
          :disabled="currentPath.length === 0"
          type="primary"
          size="small"
          @click="goBack"
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
      <DirectoryList
          v-if="currentContent.type === 'directory'"
          :items="currentContent.children"
          @navigate="handleNavigate"
      />
      <WordList
          v-else-if="currentContent.type === 'file'"
          :words="currentContent.words"
      />
    </el-main>
  </el-container>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useDark, useToggle } from '@vueuse/core'
import DirectoryList from './components/DirectoryList.vue';
import WordList from './components/WordList.vue';

const isDark = useDark();
const toggleDark = useToggle(isDark);

const isSupported = ref(!!speechSynthesis);
const currentContent = ref({type: 'directory', children: []});
const historyStack = ref([]);
const currentPath = ref([]);

// 初始化目录
const init = async () => {
  try {
    const response = await fetch('/directory.json');
    currentContent.value = await response.json();
  } catch (error) {
    console.error('加载目录结构失败:', error);
  }
};

// 处理导航
const handleNavigate = async (item) => {
  historyStack.value.push(currentContent.value);
  currentPath.value.push(item.name);
  if (item.type === 'directory') {
    currentContent.value = item;
  } else if (item.type === 'file') {
    await loadWordList(item.path);
  }
};

// 加载单词列表
const loadWordList = async (path) => {
  try {
    const response = await fetch(path);
    const words = await response.json();
    currentContent.value = {type: 'file', words};
  } catch (error) {
    console.error('加载单词列表失败:', error);
  }
};

// 返回上一级
const goBack = () => {
  if (historyStack.value.length > 0) {
    currentContent.value = historyStack.value.pop();
    currentPath.value.pop();
  }
};

onMounted(() => {
  init();
});

window.addEventListener('popstate', goBack);
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