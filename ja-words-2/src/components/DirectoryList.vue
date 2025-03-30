<template>
  <div class="directory-list-container">
    <el-card
        class="directory-item"
        v-for="dir in directories"
        :key="dir.name"
        @click="navTo(dir)"
    >
      {{ dir.name }}
    </el-card>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {useRouter} from 'vue-router'

const router = useRouter()

const directories = ref<any[]>([])

// 加载目录数据
const loadDirectory = async () => {
  const response = await fetch('/directory.json')
  const data = await response.json()

  const paramDir = router.currentRoute.value.params.dir
  if (!paramDir) {
    directories.value = data.children
  } else {
    directories.value = data.children.filter((item: any) => item.name === paramDir)[0].children
  }
}

// 处理导航
const navTo = (dir: any) => {
  const routePath = router.currentRoute.value.path
  const paramDir = router.currentRoute.value.params.dir
  if (!paramDir) {
    const newPath = `${routePath}/${encodeURI(dir.name)}/lessons`
    router.push({path: newPath})
  } else {
    const newPath = `${routePath}/${encodeURI(dir.name)}/words`
    router.push({path: newPath})
  }
}

// 初始化加载
onMounted(async () => {
  await loadDirectory()
})
</script>

<style scoped>
.directory-list-container {
  overflow-y: auto;
  padding-bottom: 90px;
  box-sizing: border-box;
  height: calc(100vh - 80px);
}

.directory-list-container::-webkit-scrollbar {
  display: none;
}

.directory-item {
  max-width: 768px;
  min-width: 375px;
  margin: 0 auto 10px;
  cursor: pointer;
}
</style>