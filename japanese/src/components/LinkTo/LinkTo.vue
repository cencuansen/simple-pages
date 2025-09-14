<template>
  <a class="link-to" href="#" @click="back">↑</a>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'

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

const linkHistory = ref<HTMLElement[]>([])

const scrollParams: ScrollIntoViewOptions = {
  behavior: 'smooth',
  block: 'center',
  inline: 'nearest',
}

const linkActive = (ele: HTMLElement) => {
  ele.style.animation = 'highlight 3s ease-in-out alternate'
  ele.addEventListener('animationend', () => {
    ele.style.animation = 'none'
  })
}

const scrollTo = (to: HTMLElement) => {
  to.scrollIntoView(scrollParams)
  linkActive(to)
}

const forward = async (event: any) => {
  // 点击课文中单词跳转到单词表
  event.preventDefault()
  let from = event.target
  if (from.tagName.toLowerCase() === 'ruby') {
    from = from.parentElement
  }
  if (from.tagName.toLowerCase() === 'a') {
    const href = from.getAttribute('href')
    if (href && href.startsWith('#')) {
      setActiveWord({ textId: href.slice(1), lesson: currentIndex.value })
      await nextTick()
      const next = document.querySelector(href)
      if (next) {
        linkHistory.value.push(from)
        scrollTo(next)
      }
    }
  }
}

const back = () => {
  const previous =
    linkHistory.value.pop() || (props.container.children[0] as HTMLElement)
  setActiveWord(null)
  scrollTo(previous)
}

const targets: Element[] = []

const bindElements = () => {
  targets.length = 0
  const multi = Array.isArray(props.bind)
  if (multi) {
    const binds = props.bind as string[]
    binds.forEach((item) => {
      targets.push(...document.querySelectorAll(item))
    })
  } else {
    const bind = props.bind as string
    targets.push(...document.querySelectorAll(bind))
  }
  targets.forEach((target) => {
    target.addEventListener('click', forward)
  })
}

watch(
  () => wordLink.value,
  (val) => {
    if (val) {
      nextTick(() => {
        bindElements()
      })
    } else {
      targets.forEach((target) => {
        target.removeEventListener('click', forward)
      })
    }
  }
)

onMounted(() => {
  if (wordLink.value) {
    bindElements()
  }
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
  right: 30px;
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

@media (min-width: 700px) {
  .link-to {
    right: calc(var(--right-site-center) + var(--width-10) * 0.5);
    transform: translateX(50%);
  }
}
</style>
