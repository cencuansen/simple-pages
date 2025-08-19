<template>
  <div class="app-root">
    <div class="row">
      <div class="tab-group">
        <div
          class="tab-item"
          :class="{ yellow: fromActive === platform.name }"
          v-for="platform in platforms"
          @click="fromActive = platform.name"
        >
          {{ platform.name }}
        </div>
        <div class="tab-item" @click="from = ''">清空</div>
      </div>
      <div class="tab-main">
        <textarea name="from" id="from" v-model="from"></textarea>
      </div>
    </div>
    <div class="row">
      <div class="tab-group">
        <div
          class="tab-item"
          :class="{ yellow: toActive === platform.name }"
          v-for="platform in platforms"
          @click="toActive = platform.name"
        >
          {{ platform.name }}
        </div>
        <div class="tab-item" :class="{ red: reverse }" @click="reverse = !reverse">反序</div>
        <div class="tab-item" @click="copy">复制</div>
        <div class="info" v-if="count">共 {{ count }} 项</div>
        <div class="info" :class="{ green: green }">{{ info }}</div>
      </div>
      <div class="tab-main">
        <textarea
          name="to"
          id="to"
          v-model="to"
          ref="textarea"
          :class="{ copied: copied }"
          @click="copy"
          readonly
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type ComputedRef, ref } from 'vue'
import {
  fromAxiom,
  fromBullx,
  fromGmgn,
  fromOkx,
  toAxiom,
  toBullx,
  toGmgn,
  toOkx
} from './functions.ts'

const platforms = [
  {
    name: 'GMGN',
    from: fromGmgn,
    to: toGmgn
  },
  {
    name: 'Axiom',
    from: fromAxiom,
    to: toAxiom
  },
  {
    name: 'OKX',
    from: fromOkx,
    to: toOkx
  },
  {
    name: 'Bullx',
    from: fromBullx,
    to: toBullx
  }
]

const fromActive = ref(platforms[0].name)
const toActive = ref(platforms[1].name)

const from = ref('')
const reverse = ref(false)
const info = ref('')
const green = ref(false)
const textarea = ref<HTMLTextAreaElement>()
const copied = ref(false)
const count = ref(0)

const to: ComputedRef<string> = computed((): string => {
  count.value = 0
  if (!from.value) {
    return ''
  }
  const nowFrom = platforms.find(p => p.name === fromActive.value)
  const nowTo = platforms.find(p => p.name === toActive.value)
  if (nowFrom === undefined || nowTo === undefined) return ''
  try {
    const mid = nowFrom.from(from.value)
    count.value = mid.length
    reverse.value && mid.reverse()
    return nowTo?.to(mid) || ''
  } catch (err) {
    console.error(err)
    return ''
  }
})

const copy = async () => {
  if (!to.value) {
    return
  }
  ;(textarea.value as HTMLTextAreaElement).select()
  try {
    await navigator.clipboard.writeText(to.value)
    setTimeout(() => {
      copied.value = false
      info.value = ''
      green.value = false
    }, 3000)
    copied.value = true
    info.value = '内容已复制到剪贴板'
    green.value = true
  } catch (err) {
    console.error('复制失败:', err)
  }
}
</script>

<style scoped>
.app-root {
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  justify-content: space-around;
}

.row {
  width: 100%;
  max-width: 700px;
  height: 48vh;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tab-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tab-item {
  padding: 5px;
  user-select: none;
  cursor: pointer;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.tab-main {
  flex: 1;
}

textarea {
  padding: 10px;
  width: 100%;
  height: 100%;
}

textarea.copied {
  outline: 1px solid #4caf50;
  border: 1px solid #4caf50;
}

.active {
  color: yellow;
}

.yellow {
  color: yellow;
}

.red {
  color: red;
}

.green {
  color: green;
}
</style>
