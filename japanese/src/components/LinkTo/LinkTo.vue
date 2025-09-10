<template>
  <a class="go-top" href="#" @click="back">↑</a>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface LinkToProps {
  top: Element
  bind: string | string[]
}

const props = defineProps<LinkToProps>()

const linkHistory = ref<Element[]>([])

const scrollParams: ScrollIntoViewOptions = {
  behavior: 'smooth',
  block: 'center',
  inline: 'nearest',
}

const linkActive = (ele: Element) => {
  ele.classList.add('target-active')
  ele.addEventListener('animationend', () => {
    ele.classList.remove('target-active')
  })
}

const scrollTo = (to: Element) => {
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

<style scoped></style>
