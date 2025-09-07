import fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve, join } from 'path'
// 获取当前文件的 __filename 和 __dirname 等效值
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const file1 = join(__dirname, '../public/jsons/grammars.json')
const data1 = JSON.parse(fs.readFileSync(file1))
const res = []
for (let i = 0; i < data1.length; i++) {
  res.push({
    idx: i + 1,
    lesson: data1[i].lesson,
    title: data1[i].title,
    desc: data1[i].desc,
  })
}
fs.writeFileSync('../public/jsons/grammars.json', JSON.stringify(res, null, 2))
