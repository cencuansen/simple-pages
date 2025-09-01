import fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve, join } from 'path'
// 获取当前文件的 __filename 和 __dirname 等效值
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const file1 = join(__dirname, '../public/json/grammars.json')
const data1 = JSON.parse(fs.readFileSync(file1))
const res = []
for (let i = 0; i < data1.length; i++) {
  if (!data1[i].remark) {
    delete data1[i].remark
  }
  res.push(data1[i])
}

fs.writeFileSync('../public/json/grammars.json', JSON.stringify(res, null, 2))
