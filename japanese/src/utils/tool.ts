
// 假名字符映射
const hiraganaToKatakanaMap: { [key: string]: string } = {
  あ: 'ア',
  い: 'イ',
  う: 'ウ',
  え: 'エ',
  お: 'オ',
  か: 'カ',
  き: 'キ',
  く: 'ク',
  け: 'ケ',
  こ: 'コ',
  さ: 'サ',
  し: 'シ',
  す: 'ス',
  せ: 'セ',
  そ: 'ソ',
  た: 'タ',
  ち: 'チ',
  つ: 'ツ',
  て: 'テ',
  と: 'ト',
  な: 'ナ',
  に: 'ニ',
  ぬ: 'ヌ',
  ね: 'ネ',
  の: 'ノ',
  は: 'ハ',
  ひ: 'ヒ',
  ふ: 'フ',
  へ: 'ヘ',
  ほ: 'ホ',
  ま: 'マ',
  み: 'ミ',
  む: 'ム',
  め: 'メ',
  も: 'モ',
  や: 'ヤ',
  ゆ: 'ユ',
  よ: 'ヨ',
  ら: 'ラ',
  り: 'リ',
  る: 'ル',
  れ: 'レ',
  ろ: 'ロ',
  わ: 'ワ',
  ゐ: 'ヰ',
  ゑ: 'ヱ',
  を: 'ヲ',
  ん: 'ン',
  が: 'ガ',
  ぎ: 'ギ',
  ぐ: 'グ',
  げ: 'ゲ',
  ご: 'ゴ',
  ざ: 'ザ',
  じ: 'ジ',
  ず: 'ズ',
  ぜ: 'ゼ',
  ぞ: 'ゾ',
  だ: 'ダ',
  ぢ: 'ヂ',
  づ: 'ヅ',
  で: 'デ',
  ど: 'ド',
  ば: 'バ',
  び: 'ビ',
  ぶ: 'ブ',
  べ: 'ベ',
  ぼ: 'ボ',
  ぱ: 'パ',
  ぴ: 'ピ',
  ぷ: 'プ',
  ぺ: 'ペ',
  ぽ: 'ポ',
  ゃ: 'ャ',
  ゅ: 'ュ',
  ょ: 'ョ',
  っ: 'ッ',
  ぁ: 'ァ',
  ぃ: 'ィ',
  ぅ: 'ゥ',
  ぇ: 'ェ',
  ぉ: 'ォ',
  ゔ: 'ヴ',
}

const katakanaToHiraganaMap: { [key: string]: string } = Object.fromEntries(
  Object.entries(hiraganaToKatakanaMap).map(([key, value]) => [value, key])
)

// 判断是否为平假名
const isHiragana = (char: string): boolean => {
  const code = char.charCodeAt(0)
  return code >= 0x3040 && code <= 0x309f
}

// 判断是否为片假名
const isKatakana = (char: string): boolean => {
  const code = char.charCodeAt(0)
  return code >= 0x30a0 && code <= 0x30ff
}

// 判断是否为假名（平假名或片假名）
const isKana = (char: string): boolean => {
  return isHiragana(char) || isKatakana(char)
}

export const toHiragana = (text: string): string => {
  let result = ''

  for (let i = 0; i < text.length; i++) {
    const char = text[i]

    // 如果是片假名，转换为平假名
    if (katakanaToHiraganaMap[char]) {
      result += katakanaToHiraganaMap[char]
    } else {
      result += char
    }
  }

  return result
}

export const toKatakana = (text: string): string => {
  let result = ''

  for (let i = 0; i < text.length; i++) {
    const char = text[i]

    // 如果是平假名，转换为片假名
    if (hiraganaToKatakanaMap[char]) {
      result += hiraganaToKatakanaMap[char]
    } else {
      result += char
    }
  }

  return result
}

const isSmallKana = (char: string): boolean => {
  return ['ゃ','ゅ','ょ','ぁ','ぃ','ぅ','ぇ','ぉ','ゎ','ャ','ュ','ョ','ァ','ィ','ゥ','ェ','ォ','ヮ'].includes(char);
};

// Base mapping (hiragana + katakana normalized)
// Note: this is not exhaustive for every rare kana, but covers modern usage
const KANA_TO_ROMAJI: Record<string, string> = {
  // vowels
  'あ':'a','い':'i','う':'u','え':'e','お':'o',
  'ア':'a','イ':'i','ウ':'u','エ':'e','オ':'o',

  // k
  'か':'ka','き':'ki','く':'ku','け':'ke','こ':'ko',
  'が':'ga','ぎ':'gi','ぐ':'gu','げ':'ge','ご':'go',
  'カ':'ka','キ':'ki','ク':'ku','ケ':'ke','コ':'ko',
  'ガ':'ga','ギ':'gi','グ':'gu','ゲ':'ge','ゴ':'go',

  // s
  'さ':'sa','し':'shi','す':'su','せ':'se','そ':'so',
  'ざ':'za','じ':'ji','ず':'zu','ぜ':'ze','ぞ':'zo',
  'サ':'sa','シ':'shi','ス':'su','セ':'se','ソ':'so',
  'ザ':'za','ジ':'ji','ズ':'zu','ゼ':'ze','ゾ':'zo',

  // t
  'た':'ta','ち':'chi','つ':'tsu','て':'te','と':'to',
  'だ':'da','ぢ':'ji','づ':'zu','で':'de','ど':'do', // modern romaji
  'タ':'ta','チ':'chi','ツ':'tsu','テ':'te','ト':'to',
  'ダ':'da','ヂ':'ji','ヅ':'zu','デ':'de','ド':'do',

  // n
  'な':'na','に':'ni','ぬ':'nu','ね':'ne','の':'no',
  'ナ':'na','ニ':'ni','ヌ':'nu','ネ':'ne','ノ':'no',

  // h
  'は':'ha','ひ':'hi','ふ':'fu','へ':'he','ほ':'ho',
  'ば':'ba','び':'bi','ぶ':'bu','べ':'be','ぼ':'bo',
  'ぱ':'pa','ぴ':'pi','ぷ':'pu','ぺ':'pe','ぽ':'po',
  'ハ':'ha','ヒ':'hi','フ':'fu','ヘ':'he','ホ':'ho',
  'バ':'ba','ビ':'bi','ブ':'bu','ベ':'be','ボ':'bo',
  'パ':'pa','ピ':'pi','プ':'pu','ペ':'pe','ポ':'po',

  // m
  'ま':'ma','み':'mi','む':'mu','め':'me','も':'mo',
  'マ':'ma','ミ':'mi','ム':'mu','メ':'me','モ':'mo',

  // y
  'や':'ya','ゆ':'yu','よ':'yo',
  'ヤ':'ya','ユ':'yu','ヨ':'yo',

  // r
  'ら':'ra','り':'ri','る':'ru','れ':'re','ろ':'ro',
  'ラ':'ra','リ':'ri','ル':'ru','レ':'re','ロ':'ro',

  // w
  'わ':'wa','を':'o', // 'wo' often 'o' in modern reading
  'ワ':'wa','ヲ':'o',

  // n'
  'ん':'n','ン':'n',

  // small vowels
  'ぁ':'a','ぃ':'i','ぅ':'u','ぇ':'e','ぉ':'o',
  'ァ':'a','ィ':'i','ゥ':'u','ェ':'e','ォ':'o',

  // small ya/yu/yo (standalone rarely used; combined handled later)
  'ゃ':'ya','ゅ':'yu','ょ':'yo',
  'ャ':'ya','ュ':'yu','ョ':'yo',

  // others (common katakana)
  'ヴ':'vu','ー':'-', // long vowel mark handled specially
};

// Youon combinations (consonant + small ya/yu/yo)
const YOUON_COMBOS: Record<string,string> = {
  // k
  'きゃ':'kya','きゅ':'kyu','きょ':'kyo',
  'キャ':'kya','キュ':'kyu','キョ':'kyo',
  // s/sh
  'しゃ':'sha','しゅ':'shu','しょ':'sho',
  'シャ':'sha','シュ':'shu','ショ':'sho',
  // j
  'じゃ':'ja','じゅ':'ju','じょ':'jo',
  'ジャ':'ja','ジュ':'ju','ジョ':'jo',
  // t/chi
  'ちゃ':'cha','ちゅ':'chu','ちょ':'cho',
  'チャ':'cha','チュ':'chu','チョ':'cho',
  // n
  'にゃ':'nya','にゅ':'nyu','にょ':'nyo',
  'ニャ':'nya','ニュ':'nyu','ニョ':'nyo',
  // h/f
  'ひゃ':'hya','ひゅ':'hyu','ひょ':'hyo',
  'ヒャ':'hya','ヒュ':'hyu','ヒョ':'hyo',
  // m
  'みゃ':'mya','みゅ':'myu','みょ':'myo',
  'ミャ':'mya','ミュ':'myu','ミョ':'myo',
  // r
  'りゃ':'rya','りゅ':'ryu','りょ':'ryo',
  'リャ':'rya','リュ':'ryu','リョ':'ryo',
  // g
  'ぎゃ':'gya','ぎゅ':'gyu','ぎょ':'gyo',
  'ギャ':'gya','ギュ':'gyu','ギョ':'gyo',
  // b/p
  'びゃ':'bya','びゅ':'byu','びょ':'byo',
  'ピャ':'pya','ピュ':'pyu','ピョ':'pyo',
  'ビャ':'bya','ビュ':'byu','ビョ':'byo',
  // v (katakana)
  'ヴャ':'vya','ヴュ':'vyu','ヴョ':'vyo',
};

// Helper: get consonant to double for sokuon
const leadingConsonantToDouble = (romaji: string): string => {
  // For 'shi' -> 's', 'chi' -> 'c', 'tsu' -> 't' (rare), 'ji' -> 'j'
  // Generally take first letter unless it's a vowel
  if (!romaji) return '';
  const first = romaji[0].toLowerCase();
  if ('aeiou'.includes(first)) return ''; // no doubling
  // Special cases: 'ch' should double 'c' -> 'cchi'; 'sh' -> 'ssh'
  // Returning just the first consonant works for 'shi','chi','ja','kya' etc.
  return first;
};

// Helper: handle long vowel mark ー by repeating the previous vowel
const applyChoonpu = (result: string): string => {
  // find last vowel in result and duplicate it
  const idx = result.lastIndexOf(result.match(/[aeiou](?!.*[aeiou])/i)?.[0] || '');
  if (idx >= 0) {
    return result + result[idx];
  }
  return result; // no vowel found; ignore
};

// Helper: handle 'n' before specific letters
const finalizeNasalN = (result: string, nextCharRomaji: string): string => {
  if (!nextCharRomaji) return result + 'n';
  const nextFirst = nextCharRomaji[0]?.toLowerCase() || '';
  if (['b','m','p'].includes(nextFirst)) {
    return result + 'm';
  }
  if (['a','i','u','e','o','y'].includes(nextFirst)) {
    return result + "n'";
  }
  return result + 'n';
};


export const toRomaji = (text: string): string => {
  let result = '';
  let i = 0;

  while (i < text.length) {
    const char = text[i];

    // Long vowel mark (katakana)
    if (char === 'ー') {
      result = applyChoonpu(result);
      i++;
      continue;
    }

    // Sokuon (small tsu)
    if (char === 'っ' || char === 'ッ') {
      // Look ahead to next kana romaji to decide doubling
      const next = text[i + 1];
      // If next is a youon combo, get its romaji from YOUON_COMBOS
      let nextRomaji = '';
      if (i + 2 < text.length && isKana(next) && isSmallKana(text[i + 2])) {
        const combo = next + text[i + 2];
        nextRomaji = YOUON_COMBOS[combo] || KANA_TO_ROMAJI[next] || '';
      } else {
        nextRomaji = KANA_TO_ROMAJI[next] || '';
      }

      const consonant = leadingConsonantToDouble(nextRomaji);
      result += consonant;
      i++; // consume sokuon
      continue;
    }

    // 'ん' nasal n handling
    if (char === 'ん' || char === 'ン') {
      // Look ahead romaji
      let nextRomaji = '';
      if (i + 1 < text.length) {
        const next = text[i + 1];
        if (i + 2 < text.length && isKana(next) && isSmallKana(text[i + 2])) {
          const combo = next + text[i + 2];
          nextRomaji = YOUON_COMBOS[combo] || KANA_TO_ROMAJI[next] || '';
        } else {
          nextRomaji = KANA_TO_ROMAJI[next] || '';
        }
      }
      result = finalizeNasalN(result, nextRomaji);
      i++;
      continue;
    }

    // Youon (consonant + small ya/yu/yo)
    if (i + 1 < text.length && isKana(char) && isSmallKana(text[i + 1])) {
      const combo = char + text[i + 1];
      if (YOUON_COMBOS[combo]) {
        result += YOUON_COMBOS[combo];
        i += 2;
        continue;
      }
      // fallback to base + small vowel romaji if combo missing
      const base = KANA_TO_ROMAJI[char] || char;
      const small = KANA_TO_ROMAJI[text[i + 1]] || text[i + 1];
      result += base + small;
      i += 2;
      continue;
    }

    // Normal kana
    if (isKana(char)) {
      const romaji = KANA_TO_ROMAJI[char];
      result += romaji ?? char;
      i++;
      continue;
    }

    // Non-kana chars: keep as-is
    result += char;
    i++;
  }

  return result;
};
