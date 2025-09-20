// src/stores/voiceVoxStore.ts
import { defineStore, storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import type { Speaker, VoiceVoxInfo } from '@/types/voiceVox.ts'
import { type ReadingItem, useReadingStore } from '../readingStore.ts'

export const useVoiceVoxStore = defineStore(
  'voice-vox',
  () => {
    // 默认值
    const _enable = true
    const _hostname = 'http://localhost'
    const _port = 50121
    const _version = ''
    const _info = null
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
    const _text =
      '無料で使える中品質なテキスト読み上げソフトウェア、VOICEVOXのエディター。'

    // 服务配置
    const enable = ref(_enable)
    const hostname = ref(_hostname)
    const port = ref(_port)
    const version = ref(_version)
    const info = ref<VoiceVoxInfo | null | undefined>(_info)

    const host = computed(() => `${hostname.value}:${port.value}`)
    const usable = computed(() => {
      return enable.value && Boolean(version.value)
    })

    // 角色列表
    const speakers = ref<Speaker[]>(_speakers)
    const speakerId = ref<number | null>(_speakerId)

    const accentPhrases = ref<any[]>(_accentPhrases)
    const speedScale = ref(_speedScale)
    const pitchScale = ref(_pitchScale)
    const intonationScale = ref(_intonationScale)
    const volumeScale = ref(_volumeScale)
    const prePhonemeLength = ref(_prePhonemeLength)
    const postPhonemeLength = ref(_postPhonemeLength)
    const outputSamplingRate = ref(_outputSamplingRate)
    const outputStereo = ref(_outputStereo)
    const text = ref(_text)

    // Setter 方法
    const setEnable = async (val: boolean) => {
      enable.value = val
    }
    const setHostname = async (val: string) => {
      hostname.value = val
    }
    const setPort = async (val: any) => {
      console.log('set port', val)
      port.value = val
    }

    const setAccentPhrases = (val: any[]) => (accentPhrases.value = val)
    const setSpeedScale = (val: number) => (speedScale.value = val)
    const setPitchScale = (val: number) => (pitchScale.value = val)
    const setIntonationScale = (val: number) => (intonationScale.value = val)
    const setVolumeScale = (val: number) => (volumeScale.value = val)
    const setPrePhonemeLength = (val: number) => (prePhonemeLength.value = val)
    const setPostPhonemeLength = (val: number) =>
      (postPhonemeLength.value = val)
    const setOutputSamplingRate = (val: number) =>
      (outputSamplingRate.value = val)
    const setOutputStereo = (val: boolean) => (outputStereo.value = val)
    const setText = (val: string) => (text.value = val)

    const fetchVersion = async () => {
      try {
        const url = `${host.value}/version`
        const res = await fetch(url)
        version.value = await res.json()
        info.value = {
          status: '服务正常',
          message: '',
        }
        return res.ok
      } catch (err: Error | any) {
        info.value = {
          status: '服务异常',
          message: err.message,
        }
        return false
      }
    }

    const fetchSpeakers = async () => {
      try {
        const url = `${host.value}/speakers`
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

    const _reset = () => {
      hostname.value = _hostname
      port.value = _port
      version.value = _version
      info.value = _info
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
      text.value = _text
    }

    const reset = async () => {
      _reset()
      await init()
    }

    const init = async () => {
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
    watch(() => hostname.value, _init)
    watch(() => port.value, _init)

    const synthesis = async (text: string): Promise<ArrayBuffer> => {
      if (!text) {
        throw new Error('请输入待朗读的字、词、句')
      }
      const audio_query = `${host.value}/audio_query?text=${encodeURIComponent(text)}&speaker=${speakerId.value}`
      const synthesis = `${host.value}/synthesis?speaker=${speakerId.value}`
      const audioQueryResponse = await fetch(audio_query, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const audioQueryResult = await audioQueryResponse.json()

      // 应用配置
      audioQueryResult.speedScale = speedScale.value
      audioQueryResult.pitchScale = pitchScale.value
      audioQueryResult.intonationScale = intonationScale.value
      audioQueryResult.volumeScale = volumeScale.value
      audioQueryResult.prePhonemeLength = prePhonemeLength.value
      audioQueryResult.postPhonemeLength = postPhonemeLength.value
      audioQueryResult.outputSamplingRate = outputSamplingRate.value
      audioQueryResult.outputStereo = outputStereo.value

      const synthesisResponse = await fetch(synthesis, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(audioQueryResult),
      })
      return await synthesisResponse.arrayBuffer()
    }

    // 播放相关
    const readingStore = useReadingStore()
    const { rate, volume, repeatTimes } = storeToRefs(readingStore)
    const { setIsReading, setNowTextId } = readingStore

    const audioRef = ref<HTMLAudioElement>()
    const isPlaying = ref(false)
    const currentAudio = ref('')
    const currentTime = ref(0)

    const setAudioRef = (refEl: HTMLAudioElement | undefined | null) => {
      audioRef.value = refEl || void 0
    }

    // 播放单个 ReadingItem
    const voiceVoxOne = async (item: ReadingItem) => {
      if (!audioRef.value || !item) return

      isPlaying.value = true
      setNowTextId(item.id)
      currentAudio.value = item.text

      let playCount = 0

      const playLoop = async () => {
        if (playCount >= repeatTimes.value) {
          isPlaying.value = false
          return
        }

        try {
          // 1. 调用 synthesis 获取音频数据
          const buffer = await synthesis(item.text)
          const blob = new Blob([buffer], { type: 'audio/wav' })
          const url = URL.createObjectURL(blob)

          // 2. 设置播放参数
          audioRef.value!.playbackRate = rate.value
          audioRef.value!.volume = volume.value
          audioRef.value!.src = url

          audioRef.value!.ontimeupdate = onTimeUpdate
          audioRef.value!.onplay = onPlay
          audioRef.value!.onpause = onPause
          audioRef.value!.onabort = onAbort
          audioRef.value!.onerror = onError

          // 3. 播放
          await audioRef.value!.play()
          playCount++

          // 4. 播放结束监听
          audioRef.value!.addEventListener(
            'ended',
            () => {
              URL.revokeObjectURL(url) // 释放 URL
              if (playCount < repeatTimes.value) {
                playLoop()
              } else {
                isPlaying.value = false
              }
            },
            { once: true }
          )
        } catch (err) {
          console.error('播放失败:', err)
          isPlaying.value = false
        }
      }

      await playLoop()
    }

    // 播放多个 ReadingItem
    const voiceVoxList = async (items: ReadingItem[]) => {
      if (!audioRef.value || items.length === 0) return

      isPlaying.value = true
      let listRepeatCount = 0
      let currentIndex = 0

      const playNext = async () => {
        if (currentIndex >= items.length) {
          currentIndex = 0
          listRepeatCount++
          if (listRepeatCount >= repeatTimes.value) {
            isPlaying.value = false
            return
          }
        }

        const item = items[currentIndex]
        setNowTextId(item.id)
        currentAudio.value = item.text

        try {
          const buffer = await synthesis(item.text)
          const blob = new Blob([buffer], { type: 'audio/wav' })
          const url = URL.createObjectURL(blob)

          audioRef.value!.playbackRate = rate.value
          audioRef.value!.volume = volume.value
          audioRef.value!.src = url

          audioRef.value!.ontimeupdate = onTimeUpdate
          audioRef.value!.onplay = onPlay
          audioRef.value!.onpause = onPause
          audioRef.value!.onabort = onAbort
          audioRef.value!.onerror = onError

          await audioRef.value!.play()

          audioRef.value!.addEventListener(
            'ended',
            () => {
              URL.revokeObjectURL(url)
              currentIndex++
              playNext()
            },
            { once: true }
          )
        } catch (err) {
          console.error('播放失败:', err)
          isPlaying.value = false
        }
      }

      await playNext()
    }

    const voiceVoxPause = () => {
      if (isPlaying.value && audioRef.value) {
        audioRef.value.pause()
        isPlaying.value = false
      }
    }

    const onTimeUpdate = (e: Event) => {
      currentTime.value = (e.target as HTMLAudioElement)?.currentTime || 0
    }

    const onPlay = () => {
      isPlaying.value = true
    }

    const onPause = () => {
      isPlaying.value = false
    }

    const onError = () => {
      isPlaying.value = false
    }

    const onAbort = () => {
      // isPlaying.value = false
    }

    watch(() => isPlaying.value, (newVal) => {
      console.log('voicevox watch isPlaying', newVal)
      setIsReading(newVal)
    })

    return {
      reset,
      init,

      // 服务配置
      enable,
      usable,
      info,
      hostname,
      port,
      setEnable,
      setHostname,
      setPort,

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
      text,

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
      setText,
      setAudioRef,

      isPlaying,

      synthesis,
      voiceVoxOne,
      voiceVoxList,
      voiceVoxPause,
    }
  },
  {
    persist: {
      pick: [
        'enable',
        'hostname',
        'port',
        'speakerId',
        'accentPhrases',
        'speedScale',
        'pitchScale',
        'intonationScale',
        'volumeScale',
        'prePhonemeLength',
        'postPhonemeLength',
        'outputSamplingRate',
        'outputStereo',
      ],
    },
  }
)
