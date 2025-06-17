<template>
  <div class="aa">
    <video ref="videoRef" id="vv" data-setup='{}' class="video-js vjs-default-skin"></video>
  </div>
  <div class="playlist">
    <div @click="playNew('https://liveout.xntv.tv/a65jur/96iln2.m3u8')">item-1</div>
    <div @click="playNew('https://gcalic.v.myalicdn.com/gc/hkts07_1/index.m3u8')">item-2</div>
    <div @click="playNew('https://gcalic.v.myalicdn.com/gc/hkylxs06_1/index.m3u8')">item-3</div>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, onUnmounted} from 'vue';
import videojs from "video.js";
import "video.js/dist/video-js.css";
import '@videojs/http-streaming';

const videoRef = ref<HTMLVideoElement>();

let player: videojs.Player;

const playNew = (url: string) => {
  if (player) {
    player.src({
      src: url,
      type: 'application/x-mpegURL'
    });
    // 如果需要自动播放可以加上
    player.play();
  }
}

onMounted(() => {
  player = videojs('vv', {
    autoplay: false,
    controls: true,
    poster: "",
    html5: {
      vhs: {
        overrideNative: true,
        enableLowInitialPlaylist: true,
        smoothQualityChange: true,
        useBandwidthFromLocalStorage: true
      }
    }
  });

  player.on('error', () => {
    console.log('Player error', player.error());
  });
});

onUnmounted(() => {
  if (player) {
    player.dispose();
  }
});
</script>

<style scoped>
.aa {
  width: 640px;
  height: 360px;
}

#vv {
  width: 100%;
  height: 100%;
}

.playlist {
  user-select: none;
}
</style>
