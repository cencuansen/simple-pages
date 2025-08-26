import fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve, join } from 'path'
// 获取当前文件的 __filename 和 __dirname 等效值
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const file = join(__dirname, '../public/json/grammars.json')
const data = JSON.parse(fs.readFileSync(file))

const lessonIdx = [...new Set(data.map((d) => Number(d.lesson)))].sort()

let index = 1
const result = []

for (let i = 0; i < lessonIdx.length; i++) {
  const lesson = lessonIdx[i]
  const res = data
    .filter((d) => d.lesson === lesson)
    .map((d) => {
      d.idx = index++
      return d
    })
  result.push(...res)
}

fs.writeFileSync(file, JSON.stringify(result, null, 2))
