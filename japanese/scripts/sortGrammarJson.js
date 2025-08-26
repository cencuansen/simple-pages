// const fs = require('fs');
import fs from 'fs'

const file = '../public/json/grammars.json'
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
