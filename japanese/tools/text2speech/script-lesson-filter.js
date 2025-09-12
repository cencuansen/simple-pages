const fs = require('fs')

const kataText = (text) => text.replace(/![^(]+\(([^)]+)\)/g, '$1').replace(/\s+/g, '')
const baseText = (text) => text.replace(/!([^(]+)\(([^)]+)\)/g, '$1').replace(/\s+/g, '')

// const text = "!李(り)さんは　!中国人(ちゅうごくじん)です。"
// console.log(kataText(text));
// console.log(baseText(text));

const input = './full.json'
const data = JSON.parse(fs.readFileSync(input).toString())
const result = data.filter(item => {
    if (item.base.includes('二ホン')) {
        const audio = `D:/project-space/pages/japanese/public/audios/${item.lesson}/${item.textId}.mp3`
        if (fs.existsSync(audio)) {
            try {
                fs.unlinkSync(audio);
                console.log('文件删除成功:', audio);
            } catch (error) {
                console.error('文件删除失败:', error.message);
            }
        }
        return true
    }
})
fs.writeFileSync('./test.json', JSON.stringify(result, null, 2))