// src/stores/voiceVoxStore.ts
import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import type { Speaker, VoiceVoxInfo } from './types'

export const useVoiceVoxStore = defineStore('voice-vox', () => {
  // 默认值
  const _enable = true
  const _host = 'http://localhost'
  const _port = 50121
  const _version = ''
  const _info = null
  const _path = ''
  const _speakers: Speaker[] = []
  const _speakerId = null

  const _accentPhrases: any[] = []
  const _speedScale = 1.0
  const _pitchScale = 0.0
  const _intonationScale = 1.0
  const _volumeScale = 1.0
  const _prePhonemeLength = 0.1
  const _postPhonemeLength = 0.1
  const _outputSamplingRate = 24000
  const _outputStereo = false
  const _kana = ''

  // 服务配置
  const enable = ref(_enable)
  const host = ref(_host)
  const port = ref(_port)
  const version = ref(_version)
  const info = ref<VoiceVoxInfo | null | undefined>(_info)
  const path = ref(_path)

  const usable = computed(() => {
    return enable.value && Boolean(version.value)
  })

  // 角色列表
  const speakers = ref<Speaker[]>(_speakers)
  const speakerId = ref<number | null>(_speakerId)

  // AudioQuery 参数（全部拆成独立 ref）
  const accentPhrases = ref<any[]>(_accentPhrases)
  const speedScale = ref(_speedScale)
  const pitchScale = ref(_pitchScale)
  const intonationScale = ref(_intonationScale)
  const volumeScale = ref(_volumeScale)
  const prePhonemeLength = ref(_prePhonemeLength)
  const postPhonemeLength = ref(_postPhonemeLength)
  const outputSamplingRate = ref(_outputSamplingRate)
  const outputStereo = ref(_outputStereo)
  const kana = ref(_kana)

  // Setter 方法
  const setEnable = async (val: boolean) => {
    enable.value = val
  }
  const setHost = async (val: string) => {
    host.value = val
  }
  const setPort = async (val: number) => {
    port.value = val
  }
  const setPath = (val: string) => (path.value = val)

  const setAccentPhrases = (val: any[]) => (accentPhrases.value = val)
  const setSpeedScale = (val: number) => (speedScale.value = val)
  const setPitchScale = (val: number) => (pitchScale.value = val)
  const setIntonationScale = (val: number) => (intonationScale.value = val)
  const setVolumeScale = (val: number) => (volumeScale.value = val)
  const setPrePhonemeLength = (val: number) => (prePhonemeLength.value = val)
  const setPostPhonemeLength = (val: number) => (postPhonemeLength.value = val)
  const setOutputSamplingRate = (val: number) =>
    (outputSamplingRate.value = val)
  const setOutputStereo = (val: boolean) => (outputStereo.value = val)
  const setKana = (val: string) => (kana.value = val)

  const fetchVersion = async () => {
    try {
      const url = `${host.value}:${port.value}/version`
      const res = await fetch(url)
      version.value = await res.json()
      info.value = {
        status: '服务可用',
        message: '',
      }
      return res.ok
    } catch (err: Error | any) {
      info.value = {
        status: '服务不可用',
        message: err.message,
      }
      return false
    }
  }

  const fetchSpeakers = async () => {
    try {
      const url = `${host.value}:${port.value}/speakers`
      const res = await fetch(url)
      const data: Speaker[] = await res.json()
      speakers.value = data
      if (data.length > 0 && speakerId.value === null) {
        speakerId.value = data[0].styles[0].id
      }
    } catch (err) {
      console.error('获取 speakers 失败', err)
    }
  }

  const reset = () => {
    enable.value = _enable
    version.value = _version
    info.value = _info
    host.value = _host
    port.value = _port
    path.value = _path
    speakers.value = _speakers
    speakerId.value = _speakerId
    accentPhrases.value = _accentPhrases
    speedScale.value = _speedScale
    pitchScale.value = _pitchScale
    intonationScale.value = _intonationScale
    volumeScale.value = _volumeScale
    prePhonemeLength.value = _prePhonemeLength
    postPhonemeLength.value = _postPhonemeLength
    outputSamplingRate.value = _outputSamplingRate
    outputStereo.value = _outputStereo
    kana.value = _kana
  }

  const init = async () => {
    reset()
    await fetchVersion()
    if (!usable.value) {
      return
    }
    await fetchSpeakers()
  }

  type WatchValueType = number | string | boolean
  const _init = async (val: WatchValueType, oldVal: WatchValueType) => {
    if (enable.value && val && val !== oldVal) {
      await init()
    }
  }

  watch(() => enable.value, _init)
  watch(() => host.value, _init)
  watch(() => port.value, _init)

  return {
    init,

    // 服务配置
    enable,
    usable,
    info,
    host,
    port,
    path,
    setEnable,
    setHost,
    setPort,
    setPath,

    // 角色
    speakers,
    speakerId,
    fetchSpeakers,

    // 其他
    version,
    fetchVersion,

    // 参数
    accentPhrases,
    speedScale,
    pitchScale,
    intonationScale,
    volumeScale,
    prePhonemeLength,
    postPhonemeLength,
    outputSamplingRate,
    outputStereo,
    kana,

    // Setter
    setAccentPhrases,
    setSpeedScale,
    setPitchScale,
    setIntonationScale,
    setVolumeScale,
    setPrePhonemeLength,
    setPostPhonemeLength,
    setOutputSamplingRate,
    setOutputStereo,
    setKana,
  }
})
