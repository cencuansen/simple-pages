import {defineStore} from 'pinia'
import {ref, computed} from 'vue'

interface VoiceOption {
    name: string
    lang: string
    voice: SpeechSynthesisVoice
}

export const useSpeechStore = defineStore('speech', () => {
    // 可配置项
    const lang = ref<string>("ja-JP") // 语言
    const rate = ref<number>(1) // 语速 (0.1-10)
    const pitch = ref<number>(1) // 音高 (0-2)
    const volume = ref<number>(1) // 音量 (0-1)
    const repeatTimes = ref<number>(1) // 重复次数 (1-5)
    const voice = ref<SpeechSynthesisVoice | null>(null) // 当前选中的语音
    const voiceName = ref<string>()
    const speakingText = ref<string>()

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

    const beforeSpeak = () => {
        if (voices.value.length > 0) {
            if (voiceName.value) {
                [voice.value] = voices.value.filter(v => v.name === voiceName.value)
            } else {
                [voice.value] = voices.value
            }
            voiceName.value = voice.value?.name
        }
        lang.value = voice.value?.lang || lang.value

        stop() // 停止当前朗读
        isSpeaking.value = true
    }

    // 朗读文本
    const speak = (text: string) => {
        if (isSpeaking.value || !text) return

        beforeSpeak()

        let count = 0
        const speakLoop = () => {
            if (count >= repeatTimes.value) {
                isSpeaking.value = false
                return
            }

            speakingText.value = text

            const utterance = new SpeechSynthesisUtterance(text)
            utterance.voice = voice.value
            utterance.lang = lang.value
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

    const speakList = (textList: string[] = []) => {
        if (isSpeaking.value || textList.length === 0) return;

        beforeSpeak()

        let listRepeatCount = 0;
        let currentIndex = 0;

        const speakNext = () => {
            if (currentIndex >= textList.length) {
                // 完成一轮列表朗读
                currentIndex = 0;
                listRepeatCount++;

                if (listRepeatCount >= repeatTimes.value) {
                    // 完成所有重复次数
                    isSpeaking.value = false;
                    return;
                }
            }

            speakingText.value = textList[currentIndex]

            const utterance = new SpeechSynthesisUtterance(speakingText.value);
            utterance.voice = voice.value;
            utterance.lang = lang.value;
            utterance.rate = rate.value;
            utterance.pitch = pitch.value;
            utterance.volume = volume.value;

            utterance.onend = () => {
                currentIndex++;
                speakNext(); // 朗读下一句
            };

            window.speechSynthesis.speak(utterance);
        };

        speakNext(); // 开始朗读
    };

    // 停止朗读
    const stop = () => {
        window.speechSynthesis.cancel()
        isSpeaking.value = false
    }

    const reset = () => {
        lang.value = "ja-JP"
        rate.value = 1
        pitch.value = 1
        volume.value = 1
        repeatTimes.value = 1
        voice.value = null
        voiceName.value = undefined
        isSpeaking.value = false
    }

    const isTextSpeaking = (text: string) => speakingText.value === text

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
        speakingText,
        initVoices,
        speak,
        speakList,
        stop,
        reset,
        isTextSpeaking
    }
}, {
    persist: {
        pick: ["rate", "pitch", "volume", "repeatTimes", "voiceName"],
    }
})