import type {Options} from './def.ts'

const sentenceDelimiters = /([。！？.!?])/g; // 匹配句子结束的标点符号
// const phraseDelimiters = /([，、,;；:：])/g; // 匹配短语分隔的标点符号

function splitNaturalBreaks(text: string, maxLength: number): string[] {
    const chunks: string[] = [];

    // 按自然段切割
    const paragraphs = text.split('\n');

    for (const paragraph of paragraphs) {
        // 按句子切割
        const sentences = paragraph.split(sentenceDelimiters); // 使用正则表达式保留标点符号
        let currentChunk = '';

        for (let i = 0; i < sentences.length; i += 2) {
            const sentence = sentences[i];
            const punctuation = sentences[i + 1] || ''; // 标点符号

            // 如果当前句子加上标点符号后不超过最大长度，则添加到当前段落
            if (currentChunk.length + sentence.length + punctuation.length <= maxLength) {
                currentChunk += sentence + punctuation;
            } else {
                // 如果当前段落不为空，则将其添加到结果中
                if (currentChunk.length > 0) {
                    chunks.push(currentChunk);
                    currentChunk = '';
                }

                // 如果当前句子本身超过最大长度，则按最大长度切割
                if (sentence.length > maxLength) {
                    let remainingSentence = sentence;
                    while (remainingSentence.length > 0) {
                        // 找到最近的适当位置（如空格或标点符号）进行切割
                        let cutIndex = maxLength;
                        while (cutIndex > 0 && !/\s|[，、,;；:：。.!?]/.test(remainingSentence[cutIndex])) {
                            cutIndex--;
                        }

                        // 如果找不到适当位置，则强制切割
                        if (cutIndex === 0) {
                            cutIndex = maxLength;
                        }

                        // 添加切割后的段落
                        chunks.push(remainingSentence.slice(0, cutIndex));
                        remainingSentence = remainingSentence.slice(cutIndex);
                    }
                } else {
                    currentChunk = sentence + punctuation;
                }
            }
        }

        // 添加最后一个段落
        if (currentChunk.length > 0) {
            chunks.push(currentChunk);
        }
    }

    return chunks;
}

export default (() => {
    const isSupported = !!speechSynthesis;
    type EventCallback = (ev: SpeechSynthesisEvent) => any;
    let utterance: SpeechSynthesisUtterance | null = null;
    let onStartCallback: EventCallback = () => {
    }
    let onEndCallback: EventCallback = () => {
    }
    let onPauseCallback: EventCallback = () => {
    }
    let onResumeCallback: EventCallback = () => {
    }
    let onErrorCallback: EventCallback = () => {
    }

    const speak = (text: string, options: Options = {}) => {
        if (!isSupported) {
            console.warn('speechSynthesis is not supported in this browser.');
            return;
        }

        const maxLength: number = 150; // 每段最大长度
        const chunks: string[] = splitNaturalBreaks(text, maxLength);

        let currentIndex = 0;

        // 定义分段播放函数
        const speakNextChunk = () => {
            if (currentIndex < chunks.length) {
                const chunk = chunks[currentIndex];
                utterance = new SpeechSynthesisUtterance(chunk);

                // 设置语音合成参数
                utterance.lang = options.lang || 'en-US';
                utterance.volume = options.volume !== undefined ? options.volume : 1;
                utterance.rate = options.rate !== undefined ? options.rate : 1;
                utterance.pitch = options.pitch !== undefined ? options.pitch : 1;

                // 设置语音（如果提供）
                if (options.voice) {
                    const voices: SpeechSynthesisVoice[] = speechSynthesis.getVoices();
                    const selectedVoice: SpeechSynthesisVoice | undefined = voices.find(
                        (voice: SpeechSynthesisVoice): boolean => voice.name === options.voice
                    );
                    if (selectedVoice) {
                        utterance.voice = selectedVoice;
                    } else {
                        console.warn(`Voice "${options.voice}" not found, using default voice.`);
                    }
                }

                // 绑定事件
                utterance.onstart = onStartCallback;
                utterance.onend = speakNextChunk;
                utterance.onpause = onPauseCallback;
                utterance.onresume = onResumeCallback;
                utterance.onerror = onErrorCallback;

                if (currentIndex === chunks.length - 1) {
                    utterance.onend = onEndCallback;
                }

                // 播放当前段落
                speechSynthesis.speak(utterance);
                currentIndex++;
            }
        };

        // 开始播放第一段
        speakNextChunk();
    };

    const pause = () => {
        if (!isSupported) {
            console.warn('speechSynthesis is not supported in this browser.');
            return;
        }
        speechSynthesis.pause();
    };

    const resume = () => {
        if (!isSupported) {
            console.warn('speechSynthesis is not supported in this browser.');
            return;
        }
        speechSynthesis.resume();
    };

    const cancel = () => {
        if (!isSupported) {
            console.warn('speechSynthesis is not supported in this browser.');
            return;
        }
        speechSynthesis.cancel();
    };

    const onStart = (callback: EventCallback) => {
        onStartCallback = callback;
    };

    const onEnd = (callback: EventCallback) => {
        onEndCallback = callback;
    };

    const onPause = (callback: EventCallback) => {
        onPauseCallback = callback;
    };

    const onResume = (callback: EventCallback) => {
        onResumeCallback = callback;
    };

    const onError = (callback: EventCallback) => {
        onErrorCallback = callback;
    };

    const getVoices = (): SpeechSynthesisVoice[] => {
        if (!isSupported) {
            console.warn('speechSynthesis is not supported in this browser.');
            return [];
        }
        return speechSynthesis.getVoices();
    };

    const getLanguages = (): string[] => {
        let defaultLanguages: string[] = ['en-US', 'zh-CN', 'ja-JP'];
        let languages: string[] = getVoices().map((voice: SpeechSynthesisVoice) => voice.lang);
        if (languages.length === 0) {
            return defaultLanguages;
        }
        return [...new Set(languages)]
    }

    return {
        isSupported,
        speak,
        pause,
        resume,
        cancel,
        getVoices,
        onStart,
        onEnd,
        onPause,
        onResume,
        onError,
        getLanguages,
    };
})();