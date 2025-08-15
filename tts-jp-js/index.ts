import Client from "voicevox-client";
import fs from 'fs';
import { Buffer } from "buffer";

function saveFile(arrayBuffer: ArrayBuffer, filePath: string) {
  // 将 ArrayBuffer 转换为 Node.js 的 Buffer
  const buffer = Buffer.from(arrayBuffer);

  fs.writeFile(filePath, buffer, (err: any) => {
    if (err) {
      console.error('写入文件出错:', err);
    } else {
      console.log('文件写入成功');
    }
  });
}

const client = new Client("http://127.0.0.1:50022");

async function main() {
  const audioquery = await client.createAudioQuery("早速，企画案を検討してみます。来週中には，お返事できるはずです。", 1);
  const buffer = await audioquery.synthesis(32);

  saveFile(buffer, "./output.wav");
}

main();