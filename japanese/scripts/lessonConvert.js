import fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve, join } from 'path'
// 获取当前文件的 __filename 和 __dirname 等效值
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const file1 = join(__dirname, '../public/json/lesson.json')
const data1 = JSON.parse(fs.readFileSync(file1))

const res = data1.map((item) => {
  const obj = {}
  obj.index = item.index
  obj.audio = item.audio
  obj.title = item.title.content
  obj.sentences = item.basics
  obj.conversations = item.conversations
  obj.discussions = {
    title: item.title2.content,
    contents: item.conversations2
  }
  obj.article = {
    title: "",
    contents: []
  }
  return obj
})

fs.writeFileSync('../public/json/lesson.json', JSON.stringify(res, null, 2))
