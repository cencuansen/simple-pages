import fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve, join } from 'path'
// 获取当前文件的 __filename 和 __dirname 等效值
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const file1 = join(__dirname, '../public/jsons/jlpt-grammars-en.json')
const data1 = JSON.parse(fs.readFileSync(file1))
const res = []
for (let i = 0; i < data1.length; i++) {
  res.push({
    idx: i + 1,
    title: data1[i].grammar,
    desc: [data1[i].meaning],
    example: data1[i].example,
    level: data1[i].level,
  })
}
fs.writeFileSync('../public/jsons/jlpt-grammars-en-new.json', JSON.stringify(res, null, 2))
