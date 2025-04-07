<template>
  <div id="container" class="container">
    <div ref="container"></div>
  </div>
  <el-row class="button-group">
    <el-upload
        class="upload-button button"
        action=""
        :auto-upload="false"
        :show-file-list="false"
        :on-change="upload"
        accept="audio/*"
    >
      <template #trigger>
        <el-button type="primary">导入</el-button>
      </template>
    </el-upload>
    <el-button class="play-button button" @click="playRegion(currentRegion)">播放/暂停</el-button>
  </el-row>
  <el-row class="region-row" v-for="(reg, index) in region.getRegions().slice().sort((x,y) => x.start - y.start)"
          :key="reg.id">
    <el-text class="region-title">{{ defaultRegionName || index + 1 }}</el-text>
    <el-button @click="saveRegionAsWav(reg.id)" size="small" type="primary">下载</el-button>
    <el-button @click="playRegion(reg.id)" size="small" type="primary">播放</el-button>
    <el-button @click="removeRegion(reg.id)" size="small" type="danger">删除</el-button>
  </el-row>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import WaveSurfer from 'wavesurfer.js'
import Timeline from 'wavesurfer.js/dist/plugins/timeline.js'
import Region from 'wavesurfer.js/dist/plugins/regions.js'
import Hover from 'wavesurfer.js/dist/plugins/hover.js'
import Zoom from 'wavesurfer.js/dist/plugins/zoom.js'

const minTimeSpan = 1
const container = ref()
const wavesurfer = ref(null)
const timePoint = ref(-1)
const currentRegion = ref("")
const defaultRegionName = ref("")
const region = ref(Region.create())

const getRandom = (min, max) => Math.random() * (max - min) + min
const getRandomColor = () => `rgba(${ getRandom(0, 255) }, ${ getRandom(0, 255) }, ${ getRandom(0, 255) }, 0.5)`
const checkTimeConflict = (regions, newStart, newEnd) => {
  if (!regions || regions.length === 0) return null
  for (let i = 0; i < regions.length; i++) {
    const regionItem = regions[i]
    if (newStart >= regionItem.start && newStart <= regionItem.end) {
      return regionItem
    }
    if (newEnd >= regionItem.start && newEnd <= regionItem.end) {
      return regionItem
    }
  }
  return null
}

const upload = (uploadFile) => {
  const obj = URL.createObjectURL(uploadFile.raw)
  wavesurfer.value.load(obj)

  timePoint.value = -1
  currentRegion.value = ""
}

const playRegion = (regionId) => {
  if (wavesurfer.value.isPlaying()) {
    wavesurfer.value.pause()
    return
  }
  if (regionId) {
    const reg = region.value.getRegions().find(x => x.id === regionId)
    wavesurfer.value.play(reg.start, reg.end)
    return
  }
  wavesurfer.value.play()
}

const removeRegion = (regionId) => {
  let regions = region.value.getRegions()
  let index = -1
  for (let i = 0; i < regions.length; i++) {
    if (regions[i].id === regionId) {
      index = i
    }
  }
  if (index === -1) {
    return
  }
  region.value.getRegions()[index].remove()
  region.value.getRegions().splice(index, 1)

  timePoint.value = -1
  currentRegion.value = ""
}

const saveRegionAsWav = (regionId) => {
  const reg = region.value.getRegions().find(x => x.id === regionId)
  if (!reg) {
    console.error('Region not found!')
    return
  }

  const originalBuffer = wavesurfer.value.getDecodedData()
  const sampleRate = originalBuffer.sampleRate
  const startSample = Math.floor(reg.start * sampleRate)
  const endSample = Math.floor(reg.end * sampleRate)
  const length = endSample - startSample

  const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }

  const convertBufferToWav = (buffer) => {
    const numberOfChannels = buffer.numberOfChannels
    const sampleRate = buffer.sampleRate
    const length = buffer.length * numberOfChannels * 2
    const dataView = new DataView(new ArrayBuffer(44 + length))
    let offset = 0

    writeString(dataView, offset, 'RIFF')
    offset += 4
    dataView.setUint32(offset, 36 + length, true)
    offset += 4
    writeString(dataView, offset, 'WAVE')
    offset += 4
    writeString(dataView, offset, 'fmt ')
    offset += 4
    dataView.setUint32(offset, 16, true)
    offset += 4
    dataView.setUint16(offset, 1, true)
    offset += 2
    dataView.setUint16(offset, numberOfChannels, true)
    offset += 2
    dataView.setUint32(offset, sampleRate, true)
    offset += 4
    dataView.setUint32(offset, sampleRate * numberOfChannels * 2, true)
    offset += 4
    dataView.setUint16(offset, numberOfChannels * 2, true)
    offset += 2
    dataView.setUint16(offset, 16, true)
    offset += 2
    writeString(dataView, offset, 'data')
    offset += 4
    dataView.setUint32(offset, length, true)
    offset += 4

    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]))
        dataView.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true)
        offset += 2
      }
    }

    return new Blob([dataView], {type: 'audio/wav'})
  }

  const offlineContext = new OfflineAudioContext(
      originalBuffer.numberOfChannels,
      length,
      sampleRate
  )

  const newBuffer = offlineContext.createBuffer(
      originalBuffer.numberOfChannels,
      length,
      sampleRate
  )

  for (let channel = 0; channel < originalBuffer.numberOfChannels; channel++) {
    const originalData = originalBuffer.getChannelData(channel)
    const newData = newBuffer.getChannelData(channel)
    for (let i = 0; i < length; i++) {
      newData[i] = originalData[startSample + i]
    }
  }

  const wavBlob = convertBufferToWav(newBuffer)
  const url = window.URL.createObjectURL(wavBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'region-audio.wav'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

const handleRegionClick = (regionItem, e) => {
  e.stopPropagation()
  currentRegion.value = regionItem.id
  timePoint.value = -1
}

const handleRegionUpdate = (newRegion, side) => {
  const length = newRegion.end - newRegion.start
  if (side && length < minTimeSpan) {
    if (side === "start") {
      newRegion.start = newRegion.end - minTimeSpan
    } else if (side === "end") {
      newRegion.end = newRegion.start + minTimeSpan
    }
    return
  }

  const otherRegions = region.value.getRegions().filter(r => r.id !== newRegion.id)
  const isConflict = checkTimeConflict(otherRegions, newRegion.start, newRegion.end)
  if (isConflict) {
    if (newRegion.start <= isConflict.end && newRegion.end >= isConflict.end) {
      newRegion.start = isConflict.end + 0.1
      newRegion.end = newRegion.start + length
    } else if (newRegion.end >= isConflict.start && newRegion.start <= isConflict.start) {
      newRegion.end = isConflict.start - 0.1
      newRegion.start = newRegion.start - length
    }
  }
}

const addRegionByInteraction = (newTimePoint) => {
  if (timePoint.value === -1 || timePoint.value >= newTimePoint - minTimeSpan) {
    timePoint.value = newTimePoint
    return
  }

  const isConflict = checkTimeConflict(region.value.getRegions(), timePoint.value, newTimePoint)
  if (isConflict) {
    timePoint.value = -1
    return
  }

  region.value.addRegion({
    start: timePoint.value,
    end: newTimePoint,
    content: defaultRegionName.value,
    color: getRandomColor(),
    drag: true,
    resize: true,
    contentEditable: true
  })

  timePoint.value = -1
}

onMounted(() => {
  if (wavesurfer.value) {
    wavesurfer.value.destroy()
  }
  wavesurfer.value = WaveSurfer.create({
    container: container.value,
    height: 128,
    waveColor: "#409EFF",
    progressColor: "#409EFF",
    plugins: [
      Timeline.create({
        timeInterval: 0.1
      }),
      region.value,
      Hover.create({}),
      Zoom.create({
        scale: 0.1,
      }),
    ]
  })

  wavesurfer.value.on("interaction", (e) => {
    addRegionByInteraction(e)
  })

  region.value.on('region-clicked', handleRegionClick)
  region.value.on('region-update', handleRegionUpdate)
})
</script>

<style scoped>
.container {
  height: 180px;
}

.button-group > * {
  margin-right: 10px;
}

.button-group > *:last-child {
  margin-right: 0;
}

.el-row {
  margin-bottom: 10px;
}

.region-title {
  width: 100px;
}

.region-row > * {
  margin-right: 3px;
}

.region-row > *:last-child {
  margin-right: 0;
}
</style>