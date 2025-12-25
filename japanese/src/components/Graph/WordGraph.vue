<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as d3 from 'd3'
import type { WordItem } from '@/types/word.ts'
import { ArrowLeft, FullScreen, Aim } from '@element-plus/icons-vue'

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
const relationTypes = ['全部', '同音', '读音相近', '包含/派生', '共有词根']

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
const findRelatedWords = (targetWord: WordItem) => {
  // 定义分组桶
  const groups: Record<string, { node: Node; link: Link }[]> = {
    同音: [],
    读音相近: [],
    '包含/派生': [],
    共有词根: [],
  }

  const normalizeKana = (k: string) =>
    k?.replace(/[っッーぁぃぅぇぉゃゅょ]/g, '') ?? ''
  const extractKanji = (s: string) => s.replace(/[^\u4e00-\u9faf]/g, '')
  const targetKanji = extractKanji(targetWord.word)

  props.allWords.forEach((w) => {
    if (w.textId === targetWord.textId) return

    let type = ''
    if (w.kana === targetWord.kana) {
      type = '同音'
    } else if (normalizeKana(w.kana) === normalizeKana(targetWord.kana)) {
      type = '读音相近'
    } else if (
      w.word.includes(targetWord.word) ||
      targetWord.word.includes(w.word)
    ) {
      type = '包含/派生'
    } else if (targetKanji.length > 0) {
      const currentKanji = extractKanji(w.word)
      const common = [...targetKanji].filter((char) =>
        currentKanji.includes(char)
      )
      if (common.length > 0) type = '共有词根'
    }

    if (type && groups[type]) {
      groups[type].push({
        node: { id: w.textId, data: w, isCurrent: false },
        link: { source: targetWord.textId, target: w.textId, type },
      })
    }
  })

  // 结果合并策略
  if (activeType.value !== '全部') {
    return groups[activeType.value as keyof typeof groups].slice(0, 30) || []
  } else {
    // 均衡分配：每种类型先取 8 个，确保多样性，总数约 30 个
    return [
      ...groups['同音'].slice(0, 8),
      ...groups['读音相近'].slice(0, 8),
      ...groups['包含/派生'].slice(0, 8),
      ...groups['共有词根'].slice(0, 8),
    ]
  }
}

// --- D3 渲染引擎 ---
const initGraph = async (targetWord: WordItem) => {
  await nextTick()
  if (!svgRef.value || !containerRef.value) return

  const width = containerRef.value.clientWidth
  const height = containerRef.value.clientHeight

  const relatedData = findRelatedWords(targetWord)
  visibleWords.value = [targetWord, ...relatedData.map((d) => d.node.data)]

  const nodes: Node[] = [
    {
      id: targetWord.textId,
      data: targetWord,
      isCurrent: true,
      x: width / 2,
      y: height / 2,
    },
    ...relatedData.map((d) => ({ ...d.node })),
  ]
  const links: Link[] = relatedData.map((d) => ({ ...d.link }))

  const svg = d3.select(svgRef.value)
  svg.selectAll('*').remove()
  const g = svg.append('g')

  const zoom = d3
    .zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.1, 3])
    .on('zoom', (event) => g.attr('transform', event.transform))
  svg.call(zoom as any)

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
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(65))

  const link = g
    .append('g')
    .selectAll('line')
    .data(links)
    .join('line')
    .attr('stroke', 'var(--el-border-color)')
    .attr('stroke-dasharray', (d) => (d.type === '共有词根' ? '4 4' : '0')) // 词根共有用虚线表示
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
    .style('filter', 'drop-shadow(0 2px 6px var(--el-box-shadow-lighter))')

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

onMounted(() => {
  initGraph(props.currentWord)
  document.addEventListener('fullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
})

// 监听当前词变化或筛选类型变化
watch([() => props.currentWord, activeType], () => {
  initGraph(props.currentWord)
})

const tableRowClassName = ({ row }: { row: WordItem }) => {
  return row.textId === props.currentWord.textId ? 'active-row' : ''
}
</script>

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
          <el-segmented
            v-model="activeType"
            :options="relationTypes"
            size="small"
            class="type-filter"
          />
        </div>
        <div class="right">
          <el-tag effect="plain" round size="small" class="center-tag">
            中心词：{{ currentWord.word }}
          </el-tag>
          <el-button
            :icon="isFullscreen ? Aim : FullScreen"
            circle
            size="small"
            @click="toggleFullscreen"
          />
        </div>
      </div>
      <div ref="containerRef" class="svg-wrapper">
        <svg ref="svgRef" class="relation-svg"></svg>
      </div>
    </div>

    <div v-if="!isFullscreen" class="list-box">
      <el-table :data="visibleWords" stripe :row-class-name="tableRowClassName">
        <el-table-column prop="word" label="单词">
          <template #default="{ row }">
            <div
              :class="[
                'word-text',
                { 'is-center': row.textId === currentWord.textId },
              ]"
            >
              {{ row.word }}
            </div>
            <div v-if="row.word !== row.kana" class="kana-subtext">
              {{ row.kana }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="desc" label="释义" show-overflow-tooltip />
        <el-table-column label="操作" width="80" align="right">
          <template #default="{ row }">
            <el-button
              v-if="row.textId !== currentWord.textId"
              type="primary"
              link
              @click="handleNodeTransition(row)"
              >聚焦</el-button
            >
            <el-text v-else type="primary" size="small">中心</el-text>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

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
  transition: all 0.3s ease;
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

.graph-toolbar {
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  pointer-events: none;
}

.graph-toolbar .left,
.graph-toolbar .right {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 10px;
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

:deep(.el-table__row) {
  transition: background-color 0.3s;
}

.relation-svg {
  --node-shadow: rgba(0, 0, 0, 0.1);
}

:deep(.dark) .relation-svg {
  --node-shadow: rgba(0, 0, 0, 0.5);
}
</style>
