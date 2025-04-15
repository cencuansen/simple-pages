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
    <el-button class="play-button button" @click="playRegion(currentRegion)" type="primary">播放/暂停</el-button>
    <el-button class="play-button button" @click="resetPoint" type="danger">重置选点</el-button>
  </el-row>
  <div class="region-group">
    <el-row class="region-row" v-for="(reg, index) in region.getRegions().slice().sort((x,y) => x.start - y.start)"
            :key="reg.id">
      <el-text class="row-index">{{ index + 1 }}</el-text>
      <el-text class="region-title">{{ formatTimeRange(reg) }}</el-text>
      <!--<el-button @click="saveRegionAsWav(reg.id)" type="primary">下载</el-button>-->
      <el-button @click="copyText(formatTimeRange(reg))" type="primary">复制
      </el-button>
      <el-button @click="playRegion(reg.id)" type="primary">播放</el-button>
      <el-button @click="removeRegion(reg.id)" type="danger">删除</el-button>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import WaveSurfer from 'wavesurfer.js'
import Timeline from 'wavesurfer.js/dist/plugins/timeline.js'
import Region from 'wavesurfer.js/dist/plugins/regions.js'
import Hover from 'wavesurfer.js/dist/plugins/hover.js'
import Zoom from 'wavesurfer.js/dist/plugins/zoom.js'
import { ElMessage } from "element-plus";

const minTimeSpan = 0
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
const resetPoint = () => {
  timePoint.value = -1
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
  const reg = region.value.getRegions().find(x => x.id === regionId);
  if (!reg) {
    console.error('Region not found!');
    return;
  }

  const originalBuffer = wavesurfer.value.getDecodedData();
  const sampleRate = originalBuffer.sampleRate;
  const startSample = Math.floor(reg.start * sampleRate);
  const endSample = Math.floor(reg.end * sampleRate);
  const length = endSample - startSample;

  // 更精确的WAV文件头生成函数
  const encodeWAV = (samples, numChannels, sampleRate) => {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    /* RIFF identifier */
    writeString(view, 0, 'RIFF');
    /* file length */
    view.setUint32(4, 36 + samples.length * 2, true);
    /* RIFF type */
    writeString(view, 8, 'WAVE');
    /* format chunk identifier */
    writeString(view, 12, 'fmt ');
    /* format chunk length */
    view.setUint32(16, 16, true);
    /* sample format (raw) */
    view.setUint16(20, 1, true);
    /* channel count */
    view.setUint16(22, numChannels, true);
    /* sample rate */
    view.setUint32(24, sampleRate, true);
    /* byte rate (sample rate * block align) */
    view.setUint32(28, sampleRate * numChannels * 2, true);
    /* block align (channel count * bytes per sample) */
    view.setUint16(32, numChannels * 2, true);
    /* bits per sample */
    view.setUint16(34, 16, true);
    /* data chunk identifier */
    writeString(view, 36, 'data');
    /* data chunk length */
    view.setUint32(40, samples.length * 2, true);

    return view;
  };

  const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  // 使用更精确的浮点到16位PCM转换
  const floatTo16BitPCM = (output, offset, input) => {
    for (let i = 0; i < input.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
  };

  // 合并多通道数据
  const interleave = (input) => {
    const length = input[0].length;
    const result = new Float32Array(length * input.length);

    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < input.length; channel++) {
        result[i * input.length + channel] = input[channel][i];
      }
    }

    return result;
  };

  // 创建新的音频缓冲区
  const offlineContext = new OfflineAudioContext(
      originalBuffer.numberOfChannels,
      length,
      sampleRate
  );

  const newBuffer = offlineContext.createBuffer(
      originalBuffer.numberOfChannels,
      length,
      sampleRate
  );

  // 复制选中的音频数据
  for (let channel = 0; channel < originalBuffer.numberOfChannels; channel++) {
    const originalData = originalBuffer.getChannelData(channel);
    const newData = newBuffer.getChannelData(channel);

    // 使用更高效的数据复制方式
    newData.set(originalData.subarray(startSample, endSample));
  }

  // 准备导出数据
  const channels = [];
  for (let channel = 0; channel < newBuffer.numberOfChannels; channel++) {
    channels.push(newBuffer.getChannelData(channel));
  }

  const interleaved = interleave(channels);
  const dataView = encodeWAV(interleaved, newBuffer.numberOfChannels, sampleRate);
  const wavData = new DataView(dataView.buffer);

  // 写入PCM数据
  floatTo16BitPCM(wavData, 44, interleaved);

  // 创建并下载文件
  const blob = new Blob([wavData], {type: 'audio/wav'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `region-${ reg.start.toFixed(2) }-${ reg.end.toFixed(2) }.wav`;
  document.body.appendChild(link);
  link.click();

  // 清理
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
};

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

const timeFormat = (seconds) => {
  // 计算小时、分钟、秒、毫秒
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.round((seconds - Math.floor(seconds)) * 1000);

  // 补零处理（确保两位数或三位数）
  const paddedHrs = String(hrs).padStart(2, '0');
  const paddedMins = String(mins).padStart(2, '0');
  const paddedSecs = String(secs).padStart(2, '0');
  const paddedMs = String(ms).padStart(3, '0').slice(0, 3); // 确保毫秒是3位

  return `${ paddedHrs }:${ paddedMins }:${ paddedSecs }.${ paddedMs }`;
}

const formatTimeRange = (reg) => {
  return `${ timeFormat(reg.start) },${ timeFormat(reg.end) }`
}

const copyText = async (text) => {
  await navigator.clipboard.writeText(text);
  ElMessage.success('复制完成');
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

.el-button + .el-button {
  margin-left: 0;
}

.el-row {
  margin-bottom: 10px;
}

.row-index {
  user-select: none;
  padding-right: 10px;
}

.region-title {
  width: 180px;
}

.region-group {
  height: calc(100vh - 250px);
  overflow-y: scroll;
}

.region-row > * {
  margin-right: 3px;
}

.region-row > *:last-child {
  margin-right: 0;
}
</style>