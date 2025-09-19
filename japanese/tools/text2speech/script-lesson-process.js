import fs from 'fs'

const kataText = (text) => text.replace(/![^(]+\(([^)]+)\)/g, '$1').replace(/\s+/g, '')
const baseText = (text) => text.replace(/!([^(]+)\(([^)]+)\)/g, '$1').replace(/\s+/g, '')

// const text = "!李(り)さんは　!中国人(ちゅうごくじん)です。"
// console.log(kataText(text));
// console.log(baseText(text));

const input = './lesson.json'
const data = JSON.parse(fs.readFileSync(input).toString())
const result = []
data.forEach((lesson) => {
    lesson.sentences &&
        lesson.sentences.forEach((item) => {
            if (lesson.index > 204) {
                result.push({
                    lesson: lesson.index,
                    textId: item.textId,
                    kata: kataText(item.content),
                    base: baseText(item.content),
                })
            }
        })
    lesson.conversations &&
        lesson.conversations.forEach((items) => {
            items.forEach((item) => {
                if (lesson.index > 204) {
                    result.push({
                        lesson: lesson.index,
                        textId: item.textId,
                        kata: kataText(item.content),
                        base: baseText(item.content),
                    })
                }
            })
        })
    lesson.discussions.contents &&
        lesson.discussions.contents.forEach((items) => {
            items.forEach((item) => {
                if (lesson.index > 204) {
                    result.push({
                        lesson: lesson.index,
                        textId: item.textId,
                        kata: kataText(item.content),
                        base: baseText(item.content),
                    })
                }
            })
        })
    lesson.article.contents &&
        lesson.article.contents.forEach((item) => {
            if (lesson.index > 204) {
                result.push({
                    lesson: lesson.index,
                    textId: item.textId,
                    kata: kataText(item.content),
                    base: baseText(item.content),
                })
            }
        })
})
fs.writeFileSync('./full.json', JSON.stringify(result, null, 2))