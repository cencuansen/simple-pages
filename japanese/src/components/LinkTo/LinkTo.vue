<template>
  <a class="link-to" href="#" @click="back">
    <el-badge v-if="linkHistory.length" :value="linkHistory.length">
      <el-text>↑</el-text>
    </el-badge>
    <el-text v-else>↑</el-text>
  </a>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useLessonStore } from '@/stores/lessonStore.ts'
import { useSettingStore } from '@/stores/settingStore.ts'
import { storeToRefs } from 'pinia'

const lessonStore = useLessonStore()
const { currentIndex } = storeToRefs(lessonStore)
const setActiveWord = lessonStore.setActiveWord

const settingStore = useSettingStore()
const { wordLink } = storeToRefs(settingStore)

interface LinkToProps {
  container: HTMLElement
  bind: string | string[]
}

const props = defineProps<LinkToProps>()

// 历史记录
const linkHistory = ref<HTMLElement[]>([])

const scrollParams: ScrollIntoViewOptions = {
  behavior: 'smooth',
  block: 'center',
  inline: 'nearest',
}

const linkActive = (ele: HTMLElement) => {
  ele.style.animation = 'highlight 3s ease-in-out alternate'
  ele.addEventListener(
    'animationend',
    () => {
      ele.style.animation = 'none'
    },
    { once: true }
  )
}

const scrollTo = (to: HTMLElement) => {
  to.scrollIntoView(scrollParams)
  linkActive(to)
}

// 点击课文中单词 → 跳转到单词表
const forward = async (event: MouseEvent) => {
  const selector = Array.isArray(props.bind)
    ? (props.bind as string[]).join(',')
    : (props.bind as string)

  let from = (event.target as HTMLElement).closest(
    selector
  ) as HTMLElement | null
  if (!from) return

  event.preventDefault()

  if (from.tagName.toLowerCase() === 'ruby') {
    from = from.parentElement as HTMLElement
  }

  if (from.tagName.toLowerCase() === 'a') {
    const href = from.getAttribute('href')
    if (href && href.startsWith('#')) {
      setActiveWord({
        textId: href.slice(1),
        word: from.innerText,
        lesson: currentIndex.value,
      })
      await nextTick()
      const next = document.querySelector(href)
      if (next) {
        linkHistory.value.push(from)
        scrollTo(next as HTMLElement)
      }
    }
  }
}

// 返回上一个位置
const back = (event: MouseEvent) => {
  event.preventDefault()
  const previous =
    linkHistory.value.pop() || (props.container.children[0] as HTMLElement)
  setActiveWord(null)
  scrollTo(previous)
}

// 绑定/解绑父级监听
const bindParentListener = () => {
  props.container.addEventListener('click', forward)
}
const unbindParentListener = () => {
  props.container.removeEventListener('click', forward)
}

watch(
  () => wordLink.value,
  (val) => {
    if (val) {
      nextTick(bindParentListener)
    } else {
      unbindParentListener()
    }
  }
)

watch(
  () => props.container,
  (val) => {
    if (val && wordLink.value) {
      nextTick(bindParentListener)
    }
  }
)

onBeforeUnmount(() => {
  unbindParentListener()
})
</script>

<style>
@keyframes highlight {
  0%,
  20%,
  40%,
  60%,
  80% {
    color: #ff0000;
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    color: #ff9900;
  }
  100% {
    color: inherit;
  }
}
</style>

<style scoped>
.link-to {
  position: absolute;
  right: 50px;
  bottom: 100px;
  border: none;
  width: 25px;
  height: 25px;
  line-height: 25px;
  border-radius: 50%;
  text-align: center;
  user-select: none;
  z-index: 999;
  color-scheme: inherit;
  font-size: 1.5rem;
  text-decoration: none;
  background-color: var(--el-color-primary);
}

@media (min-width: 800px) {
  .link-to {
    right: calc(var(--right-site-center) + var(--width-12) * 0.5);
    transform: translateX(50%);
  }
}
</style>
