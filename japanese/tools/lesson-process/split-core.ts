interface WordItem {
  textId: string;
  word: string;
}

export function convertText(text: string, words: WordItem[]): string {
  const annotated = text.replace(/!([^()]+)\(([^()]+)\)/g, '{$1|$2}');
  const base = annotated.replace(/\{([^|]+)\|[^}]+\}/g, '$1');

  interface Match {
    start: number;
    end: number;
    id: string;
  }

  const matches: Match[] = [];
  const sortedWords = [...words].sort((a, b) => b.word.length - a.word.length);
  let pos = 0;
  while (pos < base.length) {
    let matched = false;
    for (const w of sortedWords) {
      if (base.substring(pos, pos + w.word.length) === w.word) {
        matches.push({ start: pos, end: pos + w.word.length, id: w.textId });
        pos += w.word.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      pos++;
    }
  }

  let output = '';
  let currentBaseIdx = 0;
  let matchIdx = 0;
  let i = 0;
  while (i < annotated.length) {
    if (matchIdx < matches.length && currentBaseIdx === matches[matchIdx].start) {
      output += '[';
    }
    if (annotated[i] === '{') {
      let j = i;
      while (annotated[j] !== '}') j++;
      const segment = annotated.substring(i, j + 1);
      const pipePos = segment.indexOf('|', 1);
      const kanjiLen = segment.substring(1, pipePos).length;
      output += segment;
      currentBaseIdx += kanjiLen;
      i = j + 1;
    } else {
      output += annotated[i];
      currentBaseIdx++;
      i++;
    }
    if (matchIdx < matches.length && currentBaseIdx === matches[matchIdx].end) {
      output += '‖' + matches[matchIdx].id + ']';
      matchIdx++;
    }
  }
  return output;
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