type WordItem = {
  textId: string;
  word: string;
};

/**
 * 将 "!漢字(かな)" 转换为 "{漢字|かな}"
 */
function convertRuby(text: string): string {
  return text.replace(/!([^()]+)\(([^()]+)\)/g, (_m, kanji, kana) => {
    return `{${kanji}|${kana}}`;
  });
}

/**
 * 根据单词列表进行最长匹配标注
 */
export function convertText(text: string, words: WordItem[]): string {
  // 先把 ruby 转换好
  let rubyConverted = convertRuby(text);

  // 按长度降序排序，确保最长匹配优先
  const sortedWords = [...words].sort((a, b) => b.word.length - a.word.length);

  // 遍历匹配
  let result = rubyConverted;
  for (const { textId, word } of sortedWords) {
    // 构造匹配正则（转义特殊字符）
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // 这里匹配时允许 ruby 已经被替换成 {漢字|かな} 的形式
    const regex = new RegExp(escaped.replace(/([^\x00-\x7F]+)/g, (m) => {
      // 对日文部分做宽松匹配（因为已经替换成 {漢字|かな}）
      return m
        .split("")
        .map(ch => `(?:\\{${ch}[^}]+\\}|${ch})`)
        .join("");
    }), "g");

    // 替换成标注格式
    result = result.replace(regex, (match) => `[${match}‖${textId}]`);
  }

  return result;
}

// 测试
const text = "!最高賞(さいこうしょう)を!受賞(じゅしょう)したのをきっかけにして、!金星(きんぼし)を!上(あ)げる";
const words: WordItem[] = [
  { textId: "i_1", word: "最高賞" },
  { textId: "i_2", word: "きっかけ" },
  { textId: "i_3", word: "金星" },
  { textId: "i_4", word: "金星を上げる" },
];

console.log(convertText(text, words));