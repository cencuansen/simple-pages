/**
 * 提取纯文本：去掉 […‖id] 和 {surface|reading} 标记，只保留文字表层内容。
 */
export function extractPlainText(input: string): string {
  return input
    // 去掉带锚点的方括号，只保留中间内容
    .replace(/\[([^\]]*?)‖[^\]]*?\]/g, '$1')
    // 将所有 {surface|reading} → surface
    .replace(/\{([^|}]+)\|[^}]+\}/g, '$1');
}

/**
 * 提取带假名的文本：先去掉 […‖id]，再把全串的 {surface|reading} 转成 <ruby>…</ruby>。
 */
export function extractTextWithRuby(input: string): string {
  // 1. 去掉锚点标记
  const withoutAnchors = input.replace(/\[([^\]]*?)‖[^\]]*?\]/g, '$1');

  // 2. 全局 ruby 化
  return withoutAnchors.replace(
    /\{([^|}]+)\|([^}]+)\}/g,
    `<ruby>$1<rt d='$2'/></ruby>`
  );
}

/**
 * 提取带锚点的文本：把 […‖id] 里的内容（去掉 {…} 注音）包成 <a>，
 其他 {surface|reading} 则仅取 surface。
 */
export function extractTextWithAnchor(input: string): string {
  // 1. 先把带锚点的方括号处理成 <a>…</a>
  const withAnchors = input.replace(
    /\[([^\]]*?)‖([^\]]*?)\]/g,
    (_match, content, id) => {
      // content 可能含 {surface|reading}，去掉注音只留 surface
      const plain = content.replace(/\{([^|}]+)\|[^}]+\}/g, '$1');
      return `<a href='#${id}' class='anchor-link'>${plain}</a>`;
    }
  );

  // 2. 再把剩余的 {surface|reading} → surface
  return withAnchors.replace(/\{([^|}]+)\|[^}]+\}/g, '$1');
}

/**
 * 提取带假名和锚点的文本：
 * - […‖id] 先 ruby 化内部 {…}，然后包成 <a>。
 * - 剩余花括号也 ruby 化。
 */
export function extractTextWithRubyAndAnchor(input: string): string {
  // 1. 先处理方括号：内部 ruby，再包 <a>
  const anchorProcessed = input.replace(
    /\[([^\]]*?)‖([^\]]*?)\]/g,
    (_match, content, id) => {
      // ruby 化内部所有 {surface|reading}
      const withRuby = content.replace(
        /\{([^|}]+)\|([^}]+)\}/g,
        `<ruby>$1<rt d='$2'/></ruby>`
      );
      return `<a href='#${id}' class='anchor-link'>${withRuby}</a>`;
    }
  );

  // 2. 全局 ruby 化剩余 {surface|reading}
  return anchorProcessed.replace(
    /\{([^|}]+)\|([^}]+)\}/g,
    `<ruby>$1<rt d='$2'/></ruby>`
  );
}

// 测试
const inputText1 =
  '[{李|り}‖i_2c1a13eb3f96]さんは[{中国人|ちゅうごくじん}‖i_c618f65eab9f]です'
const inputText2 =
  'とにかく[{最初|さいしょ}‖i_a47bb76da3a6]は{言葉|ことば}が{通|つう}じなくて，とても{困|こま}りました'
const inputText3 = '[きっかけ‖i_666bb76da3a6]にして'
const inputText4 = '[{金星|きんぼし}を{上|あ}げる‖i_3cc6f4decc06]'

console.log(inputText1)
console.log(extractPlainText(inputText1))
console.log(extractTextWithRuby(inputText1))
console.log(extractTextWithAnchor(inputText1))
console.log(extractTextWithRubyAndAnchor(inputText1))
console.log('--')
console.log(inputText2)
console.log(extractPlainText(inputText2))
console.log(extractTextWithRuby(inputText2))
console.log(extractTextWithAnchor(inputText2))
console.log(extractTextWithRubyAndAnchor(inputText2))
console.log('--')
console.log(inputText3)
console.log(extractPlainText(inputText3))
console.log(extractTextWithRuby(inputText3))
console.log(extractTextWithAnchor(inputText3))
console.log(extractTextWithRubyAndAnchor(inputText3))
console.log('--')
console.log(inputText4)
console.log(extractPlainText(inputText4))
console.log(extractTextWithRuby(inputText4))
console.log(extractTextWithAnchor(inputText4))
console.log(extractTextWithRubyAndAnchor(inputText4))
