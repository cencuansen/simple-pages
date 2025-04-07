const wavesurfer = WaveSurfer.create({
    container: '#waveform',
    waveColor: '#4F4A85',
    progressColor: '#383351',
    url: '/l5.mp3',
})

wavesurfer.on('interaction', () => {
    wavesurfer.play()
})