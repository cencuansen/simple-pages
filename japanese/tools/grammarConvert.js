import fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve, join } from 'path'
// 获取当前文件的 __filename 和 __dirname 等效值
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const file1 = join(__dirname, '../public/jsons/grammars.jsons')
const data1 = JSON.parse(fs.readFileSync(file1))
const res = []
for (let i = 0; i < data1.length; i++) {
  res.push({
    idx: data1[i].idx,
    lesson: data1[i].lesson,
    title: data1[i].content,
    desc: data1[i].desc.split('<br/>'),
  })
}
fs.writeFileSync('../public/jsons/grammars.jsons', JSON.stringify(res, null, 2))
