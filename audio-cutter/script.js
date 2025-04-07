document.addEventListener('DOMContentLoaded', function() {
    // 初始化变量
    let wavesurfer;
    let audioContext;
    let audioBuffer;
    let isDragging = false;
    let startX = 0;
    let endX = 0;
    let selectionStart = 0;
    let selectionEnd = 0;
    let zoomLevel = 1;
    
    // 获取DOM元素
    const audioFileInput = document.getElementById('audioFile');
    const waveformCanvas = document.getElementById('waveform');
    const selectionDiv = document.getElementById('selection');
    const timeDisplay = document.getElementById('timeDisplay');
    const durationDisplay = document.getElementById('durationDisplay');
    const playBtn = document.getElementById('playBtn');
    const playSelectionBtn = document.getElementById('playSelectionBtn');
    const cutBtn = document.getElementById('cutBtn');
    const saveBtn = document.getElementById('saveBtn');
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const audioPlayer = document.getElementById('audioPlayer');
    const waveformContainer = document.querySelector('.waveform-container');
    
    // 初始化WaveSurfer
    function initWaveSurfer() {
        if (wavesurfer) {
            wavesurfer.destroy();
        }
        
        wavesurfer = WaveSurfer.create({
            container: '#waveform',
            waveColor: '#4a6fa5',
            progressColor: '#2c5dba',
            cursorColor: '#333',
            cursorWidth: 1,
            barWidth: 2,
            barRadius: 3,
            barGap: 2,
            height: 200,
            normalize: true,
            partialRender: true,
            plugins: [
                RegionsPlugin().create()
            ]
        });
        
        // 加载音频文件
        wavesurfer.on('ready', function() {
            playBtn.disabled = false;
            durationDisplay.textContent = wavesurfer.getDuration().toFixed(2);
        });
        
        // 播放结束
        wavesurfer.on('finish', function() {
            playBtn.textContent = '播放';
        });
        
        // 点击波形时清除选择
        wavesurfer.on('click', function() {
            clearSelection();
        });
    }
    
    // 处理文件选择
    audioFileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const fileURL = URL.createObjectURL(file);
        audioPlayer.src = fileURL;
        
        initWaveSurfer();
        wavesurfer.load(fileURL);
        
        // 启用按钮
        playSelectionBtn.disabled = false;
        cutBtn.disabled = false;
        saveBtn.disabled = false;
    });
    
    // 播放/暂停整个音频
    playBtn.addEventListener('click', function() {
        if (wavesurfer.isPlaying()) {
            wavesurfer.pause();
            playBtn.textContent = '播放';
        } else {
            wavesurfer.play();
            playBtn.textContent = '暂停';
        }
    });
    
    // 播放选中部分
    playSelectionBtn.addEventListener('click', function() {
        if (selectionStart === selectionEnd) return;
        
        wavesurfer.play(selectionStart, selectionEnd);
        playBtn.textContent = '暂停';
    });
    
    // 剪切选中部分
    cutBtn.addEventListener('click', function() {
        if (selectionStart === selectionEnd) return;
        
        // 创建一个新的音频缓冲区，只包含选中部分
        const originalBuffer = wavesurfer.backend.buffer;
        const sampleRate = originalBuffer.sampleRate;
        const startOffset = Math.floor(selectionStart * sampleRate);
        const endOffset = Math.floor(selectionEnd * sampleRate);
        const length = endOffset - startOffset;
        
        // 创建新的缓冲区
        const newBuffer = audioContext.createBuffer(
            originalBuffer.numberOfChannels,
            length,
            sampleRate
        );
        
        // 复制选中的数据
        for (let channel = 0; channel < originalBuffer.numberOfChannels; channel++) {
            const originalData = originalBuffer.getChannelData(channel);
            const newData = newBuffer.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                newData[i] = originalData[i + startOffset];
            }
        }
        
        // 更新WaveSurfer
        wavesurfer.backend.buffer = newBuffer;
        wavesurfer.drawer.drawBuffer();
        
        // 重置选择
        clearSelection();
        durationDisplay.textContent = newBuffer.duration.toFixed(2);
    });
    
    // 保存选中部分
    saveBtn.addEventListener('click', function() {
        if (selectionStart === selectionEnd) return;
        
        const originalBuffer = wavesurfer.backend.buffer;
        const sampleRate = originalBuffer.sampleRate;
        const startOffset = Math.floor(selectionStart * sampleRate);
        const endOffset = Math.floor(selectionEnd * sampleRate);
        const length = endOffset - startOffset;
        
        // 创建新的缓冲区
        const newBuffer = audioContext.createBuffer(
            originalBuffer.numberOfChannels,
            length,
            sampleRate
        );
        
        // 复制选中的数据
        for (let channel = 0; channel < originalBuffer.numberOfChannels; channel++) {
            const originalData = originalBuffer.getChannelData(channel);
            const newData = newBuffer.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                newData[i] = originalData[i + startOffset];
            }
        }
        
        // 导出为WAV文件
        exportBufferToWav(newBuffer, 'edited_audio.wav');
    });
    
    // 放大波形
    zoomInBtn.addEventListener('click', function() {
        zoomLevel *= 1.5;
        wavesurfer.zoom(zoomLevel);
    });
    
    // 缩小波形
    zoomOutBtn.addEventListener('click', function() {
        zoomLevel /= 1.5;
        if (zoomLevel < 1) zoomLevel = 1;
        wavesurfer.zoom(zoomLevel);
    });
    
    // 鼠标事件处理 - 开始选择
    waveformContainer.addEventListener('mousedown', function(e) {
        if (!wavesurfer || !wavesurfer.isReady) return;
        
        isDragging = true;
        startX = e.clientX - waveformContainer.getBoundingClientRect().left;
        selectionStart = wavesurfer.drawer.handleEvent(e) * wavesurfer.getDuration();
        
        selectionDiv.style.left = startX + 'px';
        selectionDiv.style.width = '0px';
        selectionDiv.style.display = 'block';
        
        updateTimeDisplay();
    });
    
    // 鼠标移动 - 调整选择范围
    waveformContainer.addEventListener('mousemove', function(e) {
        if (!isDragging || !wavesurfer || !wavesurfer.isReady) return;
        
        endX = e.clientX - waveformContainer.getBoundingClientRect().left;
        selectionEnd = wavesurfer.drawer.handleEvent(e) * wavesurfer.getDuration();
        
        if (endX > startX) {
            selectionDiv.style.left = startX + 'px';
            selectionDiv.style.width = (endX - startX) + 'px';
        } else {
            selectionDiv.style.left = endX + 'px';
            selectionDiv.style.width = (startX - endX) + 'px';
        }
        
        updateTimeDisplay();
    });
    
    // 鼠标释放 - 结束选择
    waveformContainer.addEventListener('mouseup', function() {
        isDragging = false;
    });
    
    // 鼠标离开容器 - 结束选择
    waveformContainer.addEventListener('mouseleave', function() {
        isDragging = false;
    });
    
    // 清除选择
    function clearSelection() {
        selectionDiv.style.display = 'none';
        selectionStart = 0;
        selectionEnd = 0;
        updateTimeDisplay();
    }
    
    // 更新时间显示
    function updateTimeDisplay() {
        timeDisplay.textContent = `${selectionStart.toFixed(2)} - ${selectionEnd.toFixed(2)}`;
    }
    
    // 导出为WAV文件
    function exportBufferToWav(buffer, filename) {
        const numChannels = buffer.numberOfChannels;
        const sampleRate = buffer.sampleRate;
        const length = buffer.length;
        
        // 创建WAV文件头
        const wavHeader = createWaveFileHeader(numChannels, sampleRate, 16, length);
        
        // 合并通道数据
        const interleaved = new Float32Array(length * numChannels);
        for (let channel = 0; channel < numChannels; channel++) {
            const channelData = buffer.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                interleaved[i * numChannels + channel] = channelData[i];
            }
        }
        
        // 转换为16位PCM
        const pcmData = new Int16Array(length * numChannels);
        for (let i = 0; i < interleaved.length; i++) {
            pcmData[i] = Math.max(-32768, Math.min(32767, interleaved[i] * 32768));
        }
        
        // 合并头和音频数据
        const wavData = new Uint8Array(wavHeader.length + pcmData.length * 2);
        wavData.set(wavHeader, 0);
        
        const dataView = new DataView(wavData.buffer);
        let offset = wavHeader.length;
        for (let i = 0; i < pcmData.length; i++, offset += 2) {
            dataView.setInt16(offset, pcmData[i], true);
        }
        
        // 创建Blob并下载
        const blob = new Blob([wavData], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    }
    
    // 创建WAV文件头
    function createWaveFileHeader(numChannels, sampleRate, bitsPerSample, dataLength) {
        const byteRate = sampleRate * numChannels * bitsPerSample / 8;
        const blockAlign = numChannels * bitsPerSample / 8;
        const dataSize = dataLength * numChannels * bitsPerSample / 8;
        
        const buffer = new ArrayBuffer(44);
        const view = new DataView(buffer);
        
        // RIFF标识
        writeString(view, 0, 'RIFF');
        // 文件长度
        view.setUint32(4, 36 + dataSize, true);
        // WAVE标识
        writeString(view, 8, 'WAVE');
        // fmt子块
        writeString(view, 12, 'fmt ');
        // fmt长度
        view.setUint32(16, 16, true);
        // 编码方式 (1 = PCM)
        view.setUint16(20, 1, true);
        // 声道数
        view.setUint16(22, numChannels, true);
        // 采样率
        view.setUint32(24, sampleRate, true);
        // 字节率
        view.setUint32(28, byteRate, true);
        // 块对齐
        view.setUint16(32, blockAlign, true);
        // 位深
        view.setUint16(34, bitsPerSample, true);
        // data子块
        writeString(view, 36, 'data');
        // data长度
        view.setUint32(40, dataSize, true);
        
        return new Uint8Array(buffer);
    }
    
    // 辅助函数：写入字符串到DataView
    function writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }
    
    // 初始化音频上下文
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        alert('您的浏览器不支持Web Audio API');
    }
});