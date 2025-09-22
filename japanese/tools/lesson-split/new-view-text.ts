// 解析文本中的标记块
function parseTextBlocks(text: string): Array<{
  type: 'plain' | 'annotated' | 'anchored';
  content: string;
  reading?: string;
  id?: string;
}> {
  // 匹配三种格式：
  // 1. 带注音和锚点: [{单词|读音}|id]
  // 2. 只带锚点: [单词|id]
  // 3. 只带注音: {单词|读音}
  // 4. 纯文本
  const pattern = /\[{([^|]+)\|([^}]+)}\|([^\]]+)\]|\[([^|]+)\|([^\]]+)\]|\{([^|]+)\|([^}]+)\}|([^[\]{}]+)/g;
  const blocks = [];
  let match;

  while ((match = pattern.exec(text)) !== null) {
    if (match[1] && match[2] && match[3]) {
      // 格式1: [{单词|读音}|id] - 带注音和锚点
      blocks.push({
        type: 'annotated',
        content: match[1],
        reading: match[2],
        id: match[3]
      });
    } else if (match[4] && match[5]) {
      // 格式2: [单词|id] - 只带锚点
      blocks.push({
        type: 'anchored',
        content: match[4],
        id: match[5]
      });
    } else if (match[6] && match[7]) {
      // 格式3: {单词|读音} - 只带注音
      blocks.push({
        type: 'annotated',
        content: match[6],
        reading: match[7]
      });
    } else if (match[8]) {
      // 纯文本部分
      blocks.push({
        type: 'plain',
        content: match[8]
      });
    }
  }

  return blocks;
}

// 1、提取纯文本
function extractPlainText(text: string): string {
  const blocks = parseTextBlocks(text);
  return blocks.map(block => block.content).join('');
}

// 2、纯文本带注音假名
function extractTextWithRuby(text: string): string {
  const blocks = parseTextBlocks(text);

  return blocks.map(block => {
    if (block.type === 'plain' || block.type === 'anchored') {
      return block.content;
    } else {
      return `<ruby>${block.content}<rt d='${block.reading}'></rt></ruby>`;
    }
  }).join('');
}

// 3、纯文本带锚点
function extractTextWithAnchor(text: string): string {
  const blocks = parseTextBlocks(text);

  return blocks.map(block => {
    if (block.type === 'plain' || block.type === 'annotated' && !block.id) {
      // 纯文本或没有id的注音文本
      return block.content;
    } else if (block.id) {
      // 有id的文本（无论是注音还是纯锚点）
      return `<a href='#${block.id}'>${block.content}</a>`;
    } else {
      return block.content;
    }
  }).join('');
}

// 4、纯文本注音假名带锚点
function extractTextWithRubyAndAnchor(text: string): string {
  const blocks = parseTextBlocks(text);

  return blocks.map(block => {
    if (block.type === 'plain') {
      return block.content;
    } else if (block.type === 'anchored') {
      // 只有锚点的情况
      return `<a href='#${block.id}'>${block.content}</a>`;
    } else if (block.id) {
      // 有注音和锚点的情况
      return `<a href='#${block.id}'><ruby>${block.content}<rt d='${block.reading}'></rt></ruby></a>`;
    } else {
      // 只有注音的情况
      return `<ruby>${block.content}<rt d='${block.reading}'></rt></ruby>`;
    }
  }).join('');
}

// 测试示例
const inputText1 = "[{李|り}|i_2c1a13eb3f96]さんは[{中国人|ちゅうごくじん}|i_c618f65eab9f]です";
const inputText2 = "とにかく[{最初|さいしょ}|i_a47bb76da3a6]は{言葉|ことば}が{通|つう}じなくて，とても{困|こま}りました";
const inputText3 = "とにかく[{最初|さいしょ}|i_a47bb76da3a6]はとても{困|こま}りました[きっかけ|i_666bb76da3a6]にして";

console.log("测试1 - 带注音和锚点的文本:");
console.log("原始文本:", inputText1);
console.log("1. 纯文本:", extractPlainText(inputText1));
console.log("2. 纯文本带注音假名:", extractTextWithRuby(inputText1));
console.log("3. 纯文本带锚点:", extractTextWithAnchor(inputText1));
console.log("4. 纯文本注音假名带锚点:", extractTextWithRubyAndAnchor(inputText1));

console.log("\n测试2 - 混合文本（有锚点和无锚点）:");
console.log("原始文本:", inputText2);
console.log("1. 纯文本:", extractPlainText(inputText2));
console.log("2. 纯文本带注音假名:", extractTextWithRuby(inputText2));
console.log("3. 纯文本带锚点:", extractTextWithAnchor(inputText2));
console.log("4. 纯文本注音假名带锚点:", extractTextWithRubyAndAnchor(inputText2));

console.log("\n测试3 - 只有锚点的文本:");
console.log("原始文本:", inputText3);
console.log("1. 纯文本:", extractPlainText(inputText3));
console.log("2. 纯文本带注音假名:", extractTextWithRuby(inputText3));
console.log("3. 纯文本带锚点:", extractTextWithAnchor(inputText3));
console.log("4. 纯文本注音假名带锚点:", extractTextWithRubyAndAnchor(inputText3));