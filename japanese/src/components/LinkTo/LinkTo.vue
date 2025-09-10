<template>
  <a class="go-top" href="#" @click="back">↑</a>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface LinkToProps {
  top: HTMLElement
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

const forward = (event: any) => {
  event.preventDefault()
  let from = event.target
  if (from.tagName.toLowerCase() === 'ruby') {
    from = from.parentElement
  }
  if (from.tagName.toLowerCase() === 'a') {
    const href = from.getAttribute('href')
    if (href && href.startsWith('#')) {
      const next = document.querySelector(href)
      if (next) {
        linkHistory.value.push(from)
        scrollTo(next)
      }
    }
  }
}

const back = () => {
  const previous = linkHistory.value.pop() || props.top
  scrollTo(previous)
}

onMounted(() => {
  const multi = Array.isArray(props.bind)
  const targets: Element[] = []
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
.go-top {
  position: absolute;
  bottom: 100px;
  right: 50px;
  width: 12px;
  height: 12px;
  border: none;
  border-radius: 50%;
  line-height: 25px;
  text-align: center;
  user-select: none;
  z-index: 999;
  color-scheme: inherit;
  font-weight: bolder;
  font-size: 1.5rem;
  color: var(--el-color-primary);
  background-color: inherit;
  backdrop-filter: blur(10000px);
  text-decoration: none;
}
</style>
