<template>
  <div class="tab-pane voicevox-accent-view" ref="container">
    <!-- 控制面板 -->
    <div class="control-panel">
      <el-form
        :inline="true"
        label-width="auto"
        class="tool-row"
        :disabled="!usable"
      >
        <el-form-item label="假名模式">
          <el-switch v-model="isKana" />
        </el-form-item>
        <el-form-item label="时长横轴">
          <el-switch v-model="useDurationX" />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            @click="fetchAccentPhrases"
          >
            查询
          </el-button>
        </el-form-item>
        <el-form-item>
          <VoiceVox
            type="primary"
            :text="text"
            :disabled="!text"
            :content="'朗读'"
          />
        </el-form-item>
      </el-form>

      <el-input
        v-model="text"
        type="textarea"
        :autosize="{ minRows: 5 }"
        placeholder="输入待朗读的字、词、句"
        :disabled="!usable"
      />
    </div>

    <!-- 结果展示 -->
    <div v-if="accentPhrases.length" class="result-panel">
      <div class="svg-list">
        <svg
          :width="svgWidth"
          :height="svgHeight"
          v-for="(ap, idx) in accentPhrases"
          :key="idx"
        >
          <!-- 背景：深色 -->
          <rect
            x="0"
            y="0"
            :width="svgWidth"
            :height="'100%'"
            :fill="backColor"
          />
          <!-- 曲线：亮色 -->
          <path
            :d="getPathD(ap)"
            fill="none"
            :stroke="foreColor"
            stroke-width="2"
          />
          <!-- 数据点 + 标签 -->
          <g v-for="(m, i) in ap.moras" :key="i">
            <circle
              :cx="getX(ap, i)"
              :cy="getY(ap, i)"
              r="3.5"
              :fill="foreColor"
            />
            <text
              :x="getX(ap, i)"
              :y="svgHeight - pad.bottom + 25"
              text-anchor="middle"
              :fill="foreColor"
              class="mora-label"
            >
              {{ m.text }}
            </text>
          </g>
          <!-- アクセント核竖线 -->
          <g v-if="getAccentX(ap) !== null">
            <line
              :x1="getAccentX(ap)"
              :y1="pad.top - 8"
              :x2="getAccentX(ap)"
              :y2="svgHeight - pad.bottom"
              :stroke="redColor"
              stroke-dasharray="4,4"
            />
            <text
              :x="getAccentX(ap)"
              :y="svgHeight * 0.5"
              text-anchor="middle"
              :fill="redColor"
              font-size="12"
            >
              <!--降调点: {{ ap.accent }}-->
            </text>
          </g>
          <!-- 标题 -->
          <text :x="pad.left" y="18" font-size="12" :fill="foreColor">
            #{{ idx + 1 }}
          </text>
        </svg>
      </div>
    </div>

    <el-empty v-else description="基于 VoiceVox 实现" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { useVoiceVoxStore } from '@/stores/voiceVox/voiceVoxStore.ts'
import { storeToRefs } from 'pinia'
import VoiceVox from '@/components/VoiceVox/VoiceVox.vue'

const voiceVoxStore = useVoiceVoxStore()
const { usable, hostname, port, speakerId } = storeToRefs(voiceVoxStore)

type Mora = {
  text: string
  consonant: string | null
  consonant_length: number | null
  vowel: string
  vowel_length: number
  pitch: number | null
}

type AccentPhrase = {
  moras: Mora[]
  accent: number
  pause_mora: Mora | null
  is_interrogative?: boolean
}

const container = ref<HTMLElement | null>(null)

const engineUrl = computed(() => `${hostname.value}:${port.value}`)
const isKana = ref(false)
const useDurationX = ref(false)
const text = ref(
  '無料で使える中品質なテキスト読み上げソフトウェア、VOICEVOXのエディター。'
)
const loading = ref(false)
const accentPhrases = ref<AccentPhrase[]>([])
const backColor = ref('#1e1e1e')
const foreColor = ref('#dddddd')
const redColor = ref('#ff4d4f')

const svgWidth = ref(720)
const svgHeight = 200
const pad = { top: 34, right: 24, bottom: 44, left: 48 }

const calculateSvgWidth = () => {
  svgWidth.value = container.value?.getBoundingClientRect().width || 720
}

onMounted(() => {
  window.addEventListener('resize', calculateSvgWidth)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', calculateSvgWidth)
})

// const isInterrogative = computed(() =>
//   // 是否疑问句
//   accentPhrases.value.some((p) => p.is_interrogative)
// )

async function fetchAccentPhrases() {
  const t = text.value.trim()
  if (!t) return ElMessage.warning('请输入文本')
  loading.value = true
  try {
    const url = `${engineUrl.value}/accent_phrases?text=${encodeURIComponent(t)}&speaker=${speakerId.value}&is_kana=${isKana.value}`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    calculateSvgWidth()

    const data = (await res.json()) as AccentPhrase[]

    // pitch 兜底处理
    for (const ap of data) {
      const ps = ap.moras.map((m) => m.pitch)
      let last: number | null = null
      for (let i = 0; i < ps.length; i++) {
        if (ps[i] == null) {
          let j = i + 1
          let right: number | null = null
          while (j < ps.length) {
            if (ps[j] != null) {
              right = ps[j] as number
              break
            }
            j++
          }
          if (last != null && right != null) ps[i] = (last + right) / 2
          else if (last != null) ps[i] = last
          else if (right != null) ps[i] = right
          else ps[i] = 5
        } else {
          last = ps[i] as number
        }
      }
      ap.moras.forEach((m, i) => (m.pitch = ps[i] as number))
    }

    accentPhrases.value = data
  } catch (e: any) {
    ElMessage.error(`获取音调失败：${e.message || e}`)
  } finally {
    loading.value = false
  }
}

// 工具函数
function getX(ap: AccentPhrase, i: number) {
  if (!useDurationX.value) {
    const step =
      (svgWidth.value - pad.left - pad.right) / Math.max(1, ap.moras.length)
    return pad.left + i * step
  } else {
    const durations = ap.moras.map(
      (m) => (m.consonant_length || 0) + (m.vowel_length || 0)
    )
    const sum = durations.reduce((a, b) => a + b, 0) || 1
    const scale = (svgWidth.value - pad.left - pad.right) / sum
    let acc = 0
    for (let idx = 0; idx < i; idx++) acc += durations[idx] * scale
    return pad.left + acc
  }
}

function getY(ap: AccentPhrase, i: number) {
  const ps = ap.moras.map((m) => m.pitch ?? 0)
  const min = Math.min(...ps)
  const max = Math.max(...ps)
  const dmin = min === max ? min - 1 : min
  const dmax = min === max ? max + 1 : max
  const y0 = pad.top
  const y1 = svgHeight - pad.bottom
  const t = (ps[i] - dmin) / (dmax - dmin || 1)
  return y1 - t * (y1 - y0)
}

function getPathD(ap: AccentPhrase) {
  if (!ap.moras.length) return ''
  let d = `M ${getX(ap, 0)},${getY(ap, 0)}`
  for (let i = 1; i < ap.moras.length; i++) {
    d += ` L ${getX(ap, i)},${getY(ap, i)}`
  }
  return d
}

function getAccentX(ap: AccentPhrase) {
  const idx = ap.accent - 1
  if (idx >= 0 && idx < ap.moras.length) {
    return getX(ap, idx)
  }
  return void 0
}
</script>

<style scoped>
.voicevox-accent-view {
  display: grid;
  gap: 16px;
}

.control-panel {
  display: flex;
  flex-direction: column;
  gap: var(--gap12);
}

.tool-row {
  display: flex;
  align-items: center;
}

.el-form-item {
  margin-bottom: 0;
}

.mora-label {
  font-size: 20px;
}
</style>