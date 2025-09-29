/**
 * 平假名、片假名的相互转换
 */
export function createBidirectionalKanaConverter() {
  const hiragana =
    'ぁあぃいぅうぇえぉおかがきぎくぐけげこごさざしじすずせぜそぞただちぢっつづてでとどなにぬねのはばぱひびぴふぶぷへべぺほぼぽまみむめもゃやゅゆょよらりるれろゎわゐゑをんゔ'
  const katakana =
    'ァアィイゥウェエォオカガキギクグケゲコゴサザシジスズセゼソゾタダチヂッツヅテデトドナニヌネノハバパヒビピフブプヘベペホボポマミムメモャヤュユョヨラリルレロヮワヰヴヲンヴ'

  const hiraToKata: { [key: string]: string } = {}
  const kataToHira: { [key: string]: string } = {}

  for (let i = 0; i < hiragana.length; i++) {
    hiraToKata[hiragana[i]] = katakana[i]
    kataToHira[katakana[i]] = hiragana[i]
  }

  return {
    toKatakana: (text: string) =>
      text
        .split('')
        .map((char) => hiraToKata[char] || char)
        .join(''),
    toHiragana: (text: string) =>
      text
        .split('')
        .map((char) => kataToHira[char] || char)
        .join(''),
  }
}
