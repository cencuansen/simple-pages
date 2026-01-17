<template>
  <el-form label-width="auto">
    <el-form-item label="是否启用">
      <el-switch v-model="enable" />
    </el-form-item>

    <!-- 服务配置 -->
    <div v-if="enable">
      <el-form-item label="服务地址">
        <div class="row">
          <el-input class="host-name" v-model="_hostname" @blur="blur" />
          <el-input-number
            class="port"
            v-model="_port"
            :min="1"
            :max="65535"
            @blur="blur"
          />
        </div>
      </el-form-item>
      <el-form-item label="服务状态">
        <div class="row">
          <el-button @click="_init" :loading="loading">刷新</el-button>
          <el-text
            class="info-status"
            :type="info?.message ? 'danger' : 'success'"
          >
            {{ info?.status }}
          </el-text>
        </div>
      </el-form-item>
    </div>

    <div v-if="usable">
      <!-- 说话人 -->
      <el-form-item label="角色">
        <el-select
          v-model="speakerId"
          placeholder="请选择角色"
          style="width: 260px"
        >
          <el-option
            v-for="speaker in speakers"
            :key="speaker.styles[0].id"
            :label="speaker.name + ' - ' + speaker.styles[0].name"
            :value="speaker.styles[0].id"
          />
        </el-select>
      </el-form-item>

      <!-- 语速 -->
      <el-form-item label="语速">
        <el-slider
          v-model="speedScale"
          :min="0.5"
          :max="2"
          :step="0.1"
          show-input
        />
      </el-form-item>

      <!-- 音高 -->
      <el-form-item label="音高">
        <el-slider
          v-model="pitchScale"
          :min="-0.5"
          :max="0.5"
          :step="0.05"
          show-input
        />
      </el-form-item>

      <!-- 抑扬 -->
      <el-form-item label="抑扬">
        <el-slider
          v-model="intonationScale"
          :min="0"
          :max="2"
          :step="0.1"
          show-input
        />
      </el-form-item>

      <!-- 音量 -->
      <el-form-item label="音量">
        <el-slider
          v-model="volumeScale"
          :min="0"
          :max="3"
          :step="0.1"
          show-input
        />
      </el-form-item>

      <!-- 前静音 -->
      <el-form-item label="前静音(s)">
        <el-input-number
          v-model="prePhonemeLength"
          :min="0"
          :max="1"
          :step="0.05"
        />
      </el-form-item>

      <!-- 后静音 -->
      <el-form-item label="后静音(s)">
        <el-input-number
          v-model="postPhonemeLength"
          :min="0"
          :max="1"
          :step="0.05"
        />
      </el-form-item>

      <!-- 输出采样率 -->
      <el-form-item label="采样率">
        <el-input-number
          v-model="outputSamplingRate"
          :min="8000"
          :max="48000"
          :step="1000"
        />
      </el-form-item>

      <!-- 立体声 -->
      <el-form-item label="立体声">
        <el-switch v-model="outputStereo" />
      </el-form-item>

      <!-- 测试 -->
      <el-form-item label="朗读测试">
        <div class="row">
          <el-input
            type="textarea"
            v-model="text"
            :autosize="{ minRows: 5 }"
            placeholder="请输入待朗读的字、词、句"
          />
          <VoiceVox :text="text" :disabled="!text" :content="'朗读'" />
        </div>
      </el-form-item>

      <!-- 重置 -->
      <el-form-item label="默认配置">
        <el-button @click="reset">恢复</el-button>
      </el-form-item>
    </div>

    <el-form-item label="voicevox">
      <a target="_blank" href="//github.com/VOICEVOX/voicevox">访问</a>
    </el-form-item>

    <el-form-item label="nemo engine">
      <a target="_blank" href="//github.com/VOICEVOX/voicevox_nemo_engine">
        访问
      </a>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useVoiceVoxStore } from '@/stores/voiceVox/voiceVoxStore'
import VoiceVox from '@/components/VoiceVox/VoiceVox.vue'

const store = useVoiceVoxStore()
const {
  enable,
  usable,
  info,
  hostname,
  port,
  speakers,
  speakerId,
  speedScale,
  pitchScale,
  intonationScale,
  volumeScale,
  prePhonemeLength,
  postPhonemeLength,
  outputSamplingRate,
  outputStereo,
  text,
} = storeToRefs(store)

const init = store.init
const reset = store.reset
const setHostname = store.setHostname
const setPort = store.setPort

const _hostname = ref(hostname.value)
const _port = ref(port.value)

const loading = ref(false)

const blur = () => {
  loading.value = true
  setHostname(_hostname.value)
  setPort(_port.value)
  loading.value = false
}

const _init = async () => {
  loading.value = true
  await init()
  loading.value = false
}

onMounted(async () => {
  setTimeout(init)
})
</script>

<style scoped>
.row {
  width: 100%;
  display: flex;
  gap: var(--gap12);
}

.host-name {
  flex: 1;
}

.port {
  width: 130px;
  flex-shrink: 0;
}

.info-status {
  width: 60px;
  text-wrap: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.el-form-item a {
  cursor: alias;
}
</style>
