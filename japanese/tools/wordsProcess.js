import fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve, join } from 'path'
// 获取当前文件的 __filename 和 __dirname 等效值
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const file1 = join(__dirname, '../public/jsons/words-junior.jsons')
const data1 = JSON.parse(fs.readFileSync(file1))
const verbs1 = data1.filter((d) => d.pos.includes('动')).map((d, i) => {d.idx = i + 1;return d})
// fs.writeFileSync(join(__dirname, './verbs-1.jsons'), JSON.stringify(verbs1))

const pageSize = 20

const totalPages = Math.ceil(verbs1.length / pageSize);

for (let page = 1; page <= totalPages; page++) {
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, verbs1.length);
  const pageData = verbs1.slice(startIndex, endIndex);

  // 生成文件名，包含序号
  const fileName = `verbs-${page}.json`;
  const filePath = join(__dirname, fileName);

  // 写入文件
  fs.writeFileSync(filePath, JSON.stringify(pageData, null, 2));
  console.log(`已保存: ${fileName} (包含 ${pageData.length} 个动词)`);
}