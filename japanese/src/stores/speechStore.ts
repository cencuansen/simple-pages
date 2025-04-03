import {defineStore} from 'pinia'
import {ref, computed} from 'vue'

interface VoiceOption {
    name: string
    lang: string
    voice: SpeechSynthesisVoice
}

export const useSpeechStore = defineStore('speech', () => {
    // 可配置项
    const rate = ref<number>(1) // 语速 (0.1-10)
    const pitch = ref<number>(1) // 音高 (0-2)
    const volume = ref<number>(1) // 音量 (0-1)
    const repeatTimes = ref<number>(1) // 重复次数 (1-5)
    const voice = ref<SpeechSynthesisVoice | null>(null) // 当前选中的语音
    const voiceName = ref<string>()

    // 系统可用语音列表
    const voices = ref<SpeechSynthesisVoice[]>([])

    // 是否正在朗读
    const isSpeaking = ref(false)

    // 获取语音选项 (用于UI选择)
    const voiceOptions = computed<VoiceOption[]>(() => {
        return voices.value.map(voice => ({
            name: voice.name,
            lang: voice.lang,
            voice
        }))
    })

    const japaneseFilter = (x: SpeechSynthesisVoice) => x.lang.indexOf('ja') > -1 && x.lang.indexOf('JP') > -1

    // 初始化语音列表
    const initVoices = () => {
        voices.value = window.speechSynthesis.getVoices().filter(japaneseFilter)
    }

    // 监听语音列表变化
    if (typeof window !== 'undefined') {
        window.speechSynthesis.onvoiceschanged = initVoices
        initVoices() // 立即初始化
    }

    // 朗读文本
    const speak = (text: string) => {
        if (isSpeaking.value) return

        if (!voiceName.value) {
            voice.value = voices.value[0]
            voiceName.value = voice.value.name
        }

        stop() // 停止当前朗读

        isSpeaking.value = true

        let count = 0
        const speakLoop = () => {
            if (count >= repeatTimes.value) {
                isSpeaking.value = false
                return
            }

            voice.value = voices.value.filter(v => v.name === voiceName.value)[0]

            const utterance = new SpeechSynthesisUtterance(text)
            utterance.voice = voice.value
            utterance.lang = voice.value.lang
            utterance.rate = rate.value
            utterance.pitch = pitch.value
            utterance.volume = volume.value

            utterance.onend = () => {
                count++
                if (count < repeatTimes.value) {
                    speakLoop()
                } else {
                    isSpeaking.value = false
                }
            }

            window.speechSynthesis.speak(utterance)
        }

        speakLoop()
    }

    // 停止朗读
    const stop = () => {
        window.speechSynthesis.cancel()
        isSpeaking.value = false
    }

    return {
        rate,
        pitch,
        volume,
        repeatTimes,
        voice,
        voiceName,
        voices,
        voiceOptions,
        isSpeaking,
        initVoices,
        speak,
        stop
    }
}, {
    persist: true
})