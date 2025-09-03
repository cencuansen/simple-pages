import fs from 'fs'
import * as path from 'node:path'

// 获取当前目录
const currentDir = process.cwd() // 或者使用 process.cwd()

try {
  // 读取当前目录下的所有文件
  const files = fs.readdirSync(currentDir)

  // 过滤出所有.json文件
  const jsonFiles = files.filter(
    (file) => path.extname(file).toLowerCase() === '.json'
  )

  const all = []
  // 遍历并读取每个JSON文件的内容
  jsonFiles.forEach((file) => {
    const filePath = path.join(currentDir, file)
    const data = fs.readFileSync(filePath, 'utf8')
    const jsonData = JSON.parse(data)
    all.push(...jsonData)
  })

  let index = 1
  let lastLesson = 0
  let lessonPrefix = 100
  all.forEach((item) => {
    if (lastLesson > item.lesson) {
      lessonPrefix += 100
    }
    item.idx = index++
    lastLesson = item.lesson
    item.lesson = lessonPrefix + item.lesson
  })

  fs.writeFileSync('all.json', JSON.stringify(all, null, 2))
} catch (err) {
  console.error('读取文件时出错:', err)
}
