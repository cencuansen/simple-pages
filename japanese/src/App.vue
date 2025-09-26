<template>
  <div class="root-header" v-if="!fullscreen">
    <div class="button-group">
      <el-segmented
        v-model="nowLabel"
        :options="labels"
        @change="segmentChange"
      />
    </div>
  </div>
  <div class="router-view">
    <el-config-provider :locale="locale">
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </el-config-provider>
  </div>
  <div v-if="rootFooterHeight" class="footer"></div>
</template>

<script setup lang="ts">
import { onBeforeMount, onMounted, ref, watch } from 'vue'
import { useLessonStore } from './stores/lessonStore'
import { useWordStore } from './stores/wordStore'
import { useGrammarStore } from './stores/grammar/grammarStore.ts'
import { useJlptGrammarStore } from './stores/grammar/jlptGrammarStore.ts'
import { useSettingStore } from './stores/settingStore.ts'
import { useConjuStore } from './stores/conjuStore.ts'
import { useJlptConjuStore } from './stores/jlptConjuStore.ts'
import { useVoiceVoxStore } from './stores/voiceVox/voiceVoxStore.ts'
import { useRoute, useRouter } from 'vue-router'
import { detectBrowser } from './utils/common.ts'
import { storeToRefs } from 'pinia'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

const locale = zhCn

const segments = ref([
  { label: '课程', path: '/lesson' },
  { label: '词汇', path: '/word' },
  { label: '词汇(jlpt)', path: '/jlpt-word' },
  { label: '语法', path: '/grammar' },
  { label: '语法(jlpt)', path: '/jlpt-grammar' },
  { label: '动词活用', path: '/verb-conju' },
  { label: '动词活用(jlpt)', path: '/jlpt-verb-conju' },
  { label: '工具', path: '/tool' },
  { label: '设置', path: '/setting' },
])

const labelMap = new Map(segments.value.map((item) => [item.label, item.path]))
const pathMap = new Map(segments.value.map((item) => [item.path, item.label]))
const labels = segments.value.map((item) => item.label)
const paths = segments.value.map((item) => item.path)
const nowLabel = ref<string>('')
const segmentChange = (value: string) => {
  const path = labelMap.get(value) || ''
  navigateTo(path)
}

const rootFooterHeight = ref(0)
onMounted(() => {
  const { type, browser } = detectBrowser()
  if (type === 'desktop') {
    rootFooterHeight.value = 0
  } else {
    if (browser === 'chrome') {
      rootFooterHeight.value = 55
    } else if (browser === 'edge') {
      rootFooterHeight.value = 105
    } else {
      rootFooterHeight.value = 0
    }
  }
  // 关键：直接设置CSS变量到文档根元素
  document.documentElement.style.setProperty(
    '--root-footer-height',
    `${rootFooterHeight.value}px`
  )
})

const router = useRouter()
const route = useRoute()
const settingStore = useSettingStore()

const { fullscreen } = storeToRefs(settingStore)

const navigateTo = (path: string) => {
  router.push(path)
}

const isActive = (path: string) => {
  return route.path.startsWith(path)
}

const lessonStore = useLessonStore()
const wordStore = useWordStore()
const grammarStore = useGrammarStore()
const jlptGrammarStore = useJlptGrammarStore()
const verbConju = useConjuStore()
const jlptConjuStore = useJlptConjuStore()
const voiceVoxStore = useVoiceVoxStore()

watch(
  () => route.path,
  () => {
    if (!isActive('/lesson')) {
      settingStore.setFullscreen(false)
    }
    nowLabel.value = pathMap.get(paths.find(isActive) || '') || ''
  }
)

onBeforeMount(() => {
  document.querySelector('h')
})

onMounted(async () => {
  await wordStore.init()
  await lessonStore.init()
  await grammarStore.init()
  await jlptGrammarStore.init()
  await verbConju.init()
  await jlptConjuStore.init()
  await voiceVoxStore.init()
})
</script>

<style scoped>
.root-header {
  display: flex;
  justify-content: center;
  overflow-y: scroll;
  user-select: none;
  height: var(--root-header-height);
}

.button-group {
  height: 80%;
  overflow-x: scroll;
  display: flex;
  align-self: center;
}

.button-group::-webkit-scrollbar {
  display: none;
}

.el-segmented {
  padding: 0;
}

.router-view {
  width: 100vw;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: calc(100vh - var(--root-header-height) - var(--root-footer-height));
}

.footer {
  width: 100%;
  height: var(--root-footer-height);
}

:deep(.active) {
  color: var(--el-color-primary);
}
</style>
