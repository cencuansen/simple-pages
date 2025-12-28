<template>
  <div class="relation-layout">
    <div
      ref="graphBoxRef"
      class="graph-box"
      :class="{ 'is-fullscreen': isFullscreen }"
    >
      <div class="graph-toolbar">
        <div class="left">
          <el-button
            v-if="history.length > 0"
            :icon="ArrowLeft"
            circle
            size="small"
            @click="goBack"
          />
        </div>
        <div class="right">
          <el-button
            :icon="isFullscreen ? Close : FullScreen"
            circle
            size="small"
            @click="toggleFullscreen"
          />
        </div>
      </div>

      <div class="graph-relation-type">
        <el-segmented
          v-model="activeType"
          :options="relationTypes.filter((r) => Boolean(groups[r].length))"
          class="type-filter"
        />
      </div>

      <div ref="containerRef" class="svg-wrapper">
        <svg ref="svgRef" class="relation-svg"></svg>
      </div>
    </div>

    <div class="list-box">
      <WordCore :data="visibleWords" :show-tags="true" :page-size="20" :pagination="true"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as d3 from 'd3'
import type { WordItem } from '@/types/word.ts'
import { ArrowLeft, FullScreen, Close } from '@element-plus/icons-vue'
import WordCore from '@/components/Word/WordCore.vue'

// --- 接口定义 ---
interface Node extends d3.SimulationNodeDatum {
  id: string
  data: WordItem
  isCurrent: boolean
}

interface Link extends d3.SimulationLinkDatum<Node> {
  type: string
}

// --- Props & Emits ---
const props = defineProps<{
  allWords: WordItem[]
  currentWord: WordItem
}>()

const emit = defineEmits(['node-click'])

// --- 响应式变量 ---
const svgRef = ref<SVGSVGElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)
const graphBoxRef = ref<HTMLDivElement | null>(null)
const isFullscreen = ref(false)

const visibleWords = ref<WordItem[]>([])
const history = ref<WordItem[]>([])

// --- 类型筛选配置 ---
const activeType = ref('全部')
const relationTypes = ['全部', '同音', '近音', '近义', '子集', '衍生']

// --- 全屏逻辑 ---
const toggleFullscreen = () => {
  if (!graphBoxRef.value) return
  if (!document.fullscreenElement) {
    graphBoxRef.value.requestFullscreen().catch((err) => {
      console.error(`全屏模式启动失败: ${err.message}`)
    })
  } else {
    document.exitFullscreen()
  }
}

const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
  nextTick(() => {
    if (props.currentWord) initGraph(props.currentWord)
  })
}

// --- 关联逻辑计算 (含配额均衡分配) ---
let groups: Record<string, { node: Node; link: Link }[]> = {
  全部: [],
  同音: [],
  近音: [],
  近义: [],
  子集: [],
  衍生: [],
}
const findRelatedWords = (targetWord: WordItem) => {
  groups = {
    全部: [],
    同音: [],
    近音: [],
    近义: [],
    子集: [],
    衍生: [],
  }

  const normalizeKana = (k: string) =>
    k?.replace(/[っッーぁぃぅぇぉゃゅょ]/g, '') ?? ''
  const extractKanji = (s: string) => s.replace(/[^\u4e00-\u9faf]/g, '')

  const targetKanji = extractKanji(targetWord.word)
  // 提取释义核心词（简单处理：取前两个字或按顿号拆分）
  const targetMeanings = targetWord.desc
    .split(/[，、；;]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1)

  props.allWords.forEach((w) => {
    if (w.textId === targetWord.textId) return

    let type = ''

    const currentMeanings = w.desc
      .split(/[，、；;]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 1)

    if (w.kana === targetWord.kana) {
      type = '同音'
    } else if (normalizeKana(w.kana) === normalizeKana(targetWord.kana)) {
      type = '近音'
    } else if (
      targetMeanings.some((m) => currentMeanings.some((c) => c === m))
    ) {
      type = '近义'
    } else if (
      w.word.includes(targetWord.word) ||
      targetWord.word.includes(w.word)
    ) {
      type = '子集'
    } else if (targetKanji.length > 0) {
      const currentKanji = extractKanji(w.word)
      const common = [...targetKanji].filter((char) =>
        currentKanji.includes(char)
      )
      if (common.length > 0) type = '衍生'
    } else if (targetMeanings.some((m) => w.desc.includes(m))) {
      type = '衍生'
    }

    if (type && groups[type]) {
      w.tags = type
      const node = {
        node: { id: w.textId, data: w, isCurrent: false },
        link: { source: targetWord.textId, target: w.textId, type },
      }
      groups[type].push(node)
      groups['全部'].push(node)
    }
  })

  if (activeType.value !== '全部') {
    return groups[activeType.value]?.slice(0, 30) || []
  } else {
    // 均衡分配：确保小类不被大类淹没
    return [
      ...groups['同音'].slice(0, 6),
      ...groups['近音'].slice(0, 6),
      ...groups['近义'].slice(0, 6),
      ...groups['子集'].slice(0, 6),
      ...groups['衍生'].slice(0, 6),
    ]
  }
}

// --- D3 渲染引擎 ---
const initGraph = async (targetWord: WordItem) => {
  await nextTick()
  if (!svgRef.value || !containerRef.value) return

  // 1. 动态获取当前物理容器宽高
  const width = containerRef.value.clientWidth
  const height = containerRef.value.clientHeight

  // 如果宽高获取不到（可能是全屏切换瞬时），提前退出防止 D3 报错
  if (width === 0 || height === 0) return

  targetWord.tags = ''
  const relatedData = findRelatedWords(targetWord)
  visibleWords.value = [targetWord, ...relatedData.map((d) => d.node.data)]

  // 2. 构造节点数据
  // 注意：如果节点已存在坐标，D3 会保留，所以我们需要在全屏切换时辅助它们回到视觉中心
  const nodes: Node[] = [
    {
      id: targetWord.textId,
      data: targetWord,
      isCurrent: true,
      x: width / 2, // 强行初始定位到中心
      y: height / 2,
    },
    ...relatedData.map((d) => ({ ...d.node })),
  ]
  const links: Link[] = relatedData.map((d) => ({ ...d.link }))

  const svg = d3.select(svgRef.value)
  svg.selectAll('*').remove()
  const g = svg.append('g')

  // 3. Zoom 自适应处理
  const zoom = d3
    .zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.1, 3])
    .on('zoom', (event) => g.attr('transform', event.transform))

  svg.call(zoom as any)
  // 每次重绘重置缩放比例，确保全屏后节点在视野内
  svg.call(zoom.transform as any, d3.zoomIdentity)

  // 4. 力导向引擎配置
  const simulation = d3
    .forceSimulation<Node>(nodes)
    .force(
      'link',
      d3
        .forceLink<Node, Link>(links)
        .id((d) => d.id)
        .distance(160)
    )
    .force('charge', d3.forceManyBody().strength(-500))
    // 关键：确保中心力根据当前 width/height 动态计算
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(65))

  // 渲染连线和节点... (保持你原有的渲染代码)
  const link = g
    .append('g')
    .selectAll('line')
    .data(links)
    .join('line')
    .attr('stroke', 'var(--el-border-color)')
    .attr('stroke-dasharray', (d) =>
      d.type === '衍生' || d.type === '近义' ? '4 4' : '0'
    )
    .attr('stroke-width', 1.5)

  const linkText = g
    .append('g')
    .selectAll('text')
    .data(links)
    .join('text')
    .attr('font-size', '10px')
    .attr('fill', 'var(--el-text-color-secondary)')
    .attr('text-anchor', 'middle')
    .text((d) => d.type)

  const node = g
    .append('g')
    .selectAll('g')
    .data(nodes)
    .join('g')
    .style('cursor', 'pointer')
    .call(drag(simulation) as any)
    .on('click', (_event, d) => {
      if (d.id === targetWord.textId) return
      handleNodeTransition(d.data)
    })

  node
    .append('circle')
    .attr('r', (d) => (d.isCurrent ? 38 : 32))
    .attr('fill', (d) =>
      d.isCurrent ? 'var(--el-color-primary)' : 'var(--el-bg-color-overlay)'
    )
    .attr('stroke', 'var(--el-color-primary)')
    .attr('stroke-width', 2)

  node
    .append('text')
    .attr('dy', '-2')
    .attr('text-anchor', 'middle')
    .attr('fill', (d) =>
      d.isCurrent ? '#ffffff' : 'var(--el-text-color-primary)'
    )
    .attr('font-weight', 'bold')
    .attr('font-size', '13px')
    .text((d) => d.data.word)

  node
    .append('text')
    .attr('dy', '15')
    .attr('text-anchor', 'middle')
    .attr('fill', (d) =>
      d.isCurrent ? '#e1f3d8' : 'var(--el-text-color-placeholder)'
    )
    .attr('font-size', '10px')
    .text((d) => d.data.kana)

  simulation.on('tick', () => {
    link
      .attr('x1', (d: any) => d.source.x)
      .attr('y1', (d: any) => d.source.y)
      .attr('x2', (d: any) => d.target.x)
      .attr('y2', (d: any) => d.target.y)
    linkText
      .attr('x', (d: any) => (d.source.x + d.target.x) / 2)
      .attr('y', (d: any) => (d.source.y + d.target.y) / 2)
    node.attr('transform', (d: any) => `translate(${d.x},${d.y})`)
  })
}

const drag = (simulation: d3.Simulation<Node, undefined>) => {
  return d3
    .drag()
    .on('start', (event) => {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      event.subject.fx = event.subject.x
      event.subject.fy = event.subject.y
    })
    .on('drag', (event) => {
      event.subject.fx = event.x
      event.subject.fy = event.y
    })
    .on('end', (event) => {
      if (!event.active) simulation.alphaTarget(0)
      event.subject.fx = null
      event.subject.fy = null
    })
}

const handleNodeTransition = (newWord: WordItem) => {
  history.value.push(props.currentWord)
  emit('node-click', newWord)
}

const goBack = () => {
  const prev = history.value.pop()
  if (prev) emit('node-click', prev)
}

const clearHistory = () => {
  history.value = []
}

defineExpose({
  clearHistory,
})

onMounted(() => {
  initGraph(props.currentWord)
  document.addEventListener('fullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
})

watch([() => props.currentWord], () => {
  activeType.value = '全部'
  initGraph(props.currentWord)
})

watch([activeType], () => {
  initGraph(props.currentWord)
})
</script>

<style>
:root {
  --box-max-width: 800px;
}
</style>

<style scoped>
.relation-layout {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
}

/* 图形区域样式 */
.graph-box {
  position: relative;
  width: 100%;
  max-width: var(--box-max-width);
  margin: 0 auto;
  height: calc(100vh - 250px);
  background-color: var(--el-bg-color-page);
  background-image:
    linear-gradient(var(--el-border-color-lighter) 1px, transparent 1px),
    linear-gradient(90deg, var(--el-border-color-lighter) 1px, transparent 1px);
  background-size: 30px 30px;
  border: 1px solid var(--el-border-color);
  border-radius: 12px;
  overflow: hidden;
}

/* 全屏状态样式适配 */
.graph-box:fullscreen {
  max-width: none;
  width: 100vw;
  height: 100vh;
  border-radius: 0;
  border: none;
}

.svg-wrapper {
  width: 100%;
  height: 100%;
}

.graph-toolbar,
.graph-relation-type {
  position: absolute;
  left: 12px;
  right: 12px;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  pointer-events: none;
}

.graph-toolbar {
  top: 12px;
}

.graph-toolbar .left,
.graph-toolbar .right {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 10px;
}

.graph-relation-type {
  top: 45px;
  pointer-events: auto;
}

.el-segmented {
  margin: 0 auto;
}

.hint-text {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  background-color: var(--el-bg-color-overlay);
  color: var(--el-text-color-secondary);
  border: 1px solid var(--el-border-color-lighter);
}

.relation-svg {
  width: 100%;
  height: 100%;
  cursor: grab;
}

.relation-svg:active {
  cursor: grabbing;
}

/* 列表区域样式 */
.list-box {
  width: 100%;
  max-width: var(--box-max-width);
  border-radius: 12px;
  margin: 0 auto;
  background-color: var(--el-bg-color);
}

.list-box el-table {
  width: 100%;
}

.word-text {
  font-weight: 500;
}

.word-text.is-center {
  color: var(--el-color-primary);
  font-weight: bold;
}

.relation-svg {
  --node-shadow: rgba(0, 0, 0, 0.1);
}

:deep(.dark) .relation-svg {
  --node-shadow: rgba(0, 0, 0, 0.5);
}
</style>
