import fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve, join } from 'path'
// 获取当前文件的 __filename 和 __dirname 等效值
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const file1 = join(__dirname, '../public/jsons/lesson.jsons')
const data1 = JSON.parse(fs.readFileSync(file1))
let index = 201
for (let i = 0; i < 32; i++) {
  const obj = {}
  obj.index = index
  obj.audio = `/audio/${index}.mp3#t=`
  obj.title = `第 ${index - 200} 課`
  obj.sentences = []
  obj.conversations = []
  obj.discussions = {
    title: "",
    contents: [],
  }
  obj.article = {
    title: "",
    contents: [],
  }
  index++
  data1.push(obj)
}

fs.writeFileSync('../public/jsons/lesson.jsons', JSON.stringify(data1, null, 2))
