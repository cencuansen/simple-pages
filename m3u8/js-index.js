import { parse, types, stringify } from 'hls-parser';
import fetch from 'node-fetch';
import { request } from 'undici';
import axios from 'axios';
// const list = 'https://freetv.fun/test_channels.m3u'
// const stream = 'https://vv.jisuzyv.com/play/YaOO3PQa/index.m3u8'

const list = 'list.m3u'
const stream = 'stream.m3u'

// const res1 = await request('D:/project-space/pages/m3u8/list.m3u');
// const text1 = await res1.text()
// console.log(text1);

const resAx = await axios.get('file:D:/project-space/pages/m3u8/list.m3u');
const textAx = await resAx.data;
console.log(textAx);

// const { statusCode, headers, body } = await request('D:/project-space/pages/m3u8/list.m3u');
// const data = await body.text();
// console.log(data);


// const res1 = await fetch(list);
// const text1 = await res1.text()
// const playlist = parse(text1);
// if (playlist.isMasterPlaylist) {
//     console.log("Master Playlist");
// } else {
//     console.log("Media Playlist");
// }

// const res2 = await fetch(stream);
// const text2 = await res2.text()
// const playlist2 = parse(text2);
// if (playlist2.isMasterPlaylist) {
//     console.log("Master Playlist");
// } else {
//     console.log("Media Playlist");
// }