<template>
  <div class="app-root">
    <div class="row">
      <div class="tab-group">
        <div
          class="tab-item"
          :class="{ active: fromActive === platform.name }"
          v-for="platform in platforms"
          @click="fromActive = platform.name"
        >
          {{ platform.name }}
        </div>
      </div>
      <div class="tab-main">
        <textarea name="from" id="from" v-model="from"></textarea>
      </div>
    </div>
    <div class="row">
      <div class="tab-group">
        <div
          class="tab-item"
          :class="{ active: toActive === platform.name }"
          v-for="platform in platforms"
          @click="toActive = platform.name"
        >
          {{ platform.name }}
        </div>
      </div>
      <div class="tab-main">
        <textarea name="to" id="to" v-model="to"></textarea>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { fromBullx, fromAxiom, fromGmgn, toBullx, toGmgn, toAxiom, fromOkx, toOkx } from './functions.ts'

const platforms = [
  {
    name: 'Bullx',
    from: fromBullx,
    to: toBullx
  },
  {
    name: 'Axiom',
    from: fromAxiom,
    to: toAxiom
  },
  {
    name: 'GMGN',
    from: fromGmgn,
    to: toGmgn
  },
  {
    name: 'OKX',
    from: fromOkx,
    to: toOkx
  }
]

const fromActive = ref(platforms[0].name)
const toActive = ref(platforms[1].name)

const from = ref('')

const to = computed(() => {
  const nowFrom = platforms.find(p => p.name === fromActive.value)
  const nowTo = platforms.find(p => p.name === toActive.value)
  if (nowFrom === undefined || nowTo === undefined) return
  return nowTo?.to(nowFrom.from(from.value))
})
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

.active {
  color: yellow;
}
</style>
