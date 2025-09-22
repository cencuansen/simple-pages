// 创建单词正则表达式
import type { Lesson, LessonSearch } from '@/types/lesson.ts'

// 获取朗读假名
export const speakText = (text: string | undefined = '') =>
  text.replace(/![^(]+\(([^)]+)\)/g, '$1')

/**
 * 提取纯文本：去掉 […‖id] 和 {surface|reading} 标记，只保留文字表层内容。
 */
function extractPlainText(input: string): string {
  return input
    // 去掉带锚点的方括号，只保留中间内容
    .replace(/\[([^\]]*?)‖[^\]]*?\]/g, '$1')
    // 将所有 {surface|reading} → surface
    .replace(/\{([^|}]+)\|[^}]+\}/g, '$1');
}

/**
 * 提取带假名的文本：先去掉 […‖id]，再把全串的 {surface|reading} 转成 <ruby>…</ruby>。
 */
function extractTextWithRuby(input: string): string {
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
function extractTextWithAnchor(input: string): string {
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
function extractTextWithRubyAndAnchor(input: string): string {
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

// 文本解析器
export const textParser = (
  wordLink = true,
  furigana = true
): ((str: string | undefined) => string) => {
  return (originalText: string | undefined) => {
    if (!originalText) return ''
    if (furigana && wordLink) {
      return extractTextWithRubyAndAnchor(originalText)
    } else if (!furigana && !wordLink) {
      return extractPlainText(originalText)
    } else if (furigana && !wordLink) {
      return extractTextWithRuby(originalText)
    } else if (!furigana && wordLink) {
      return extractTextWithAnchor(originalText)
    }
    return ''
  }
}

// 对"无假名无跳转"封装
export const displayText = (text: string) => extractPlainText(text)

export const searchLesson = (
  lessons: Lesson[],
  keyword: string | undefined
): LessonSearch[] => {
  const flatLessons = lessons.map((lesson) => {
    return [
      `${lesson.index}`,
      lesson.title,
      ...lesson.sentences.map((a) => displayText(a.content)),
      ...lesson.conversations
        .flatMap((a) => a)
        .map((a) => displayText(a.content)),
      ...lesson.discussions.contents
        .flatMap((a) => a)
        .map((a) => displayText(a.content)),
      ...lesson.article.contents.map((a) => displayText(a.content)),
    ].filter(Boolean) as string[]
  })

  if (!keyword) {
    return flatLessons
      .map((lesson) => {
        const contents = lesson.slice(2)
        return {
          idx: lesson[0],
          title: lesson[1],
          contents: [...contents.slice(0, 2), '...'],
        }
      })
      .filter((a) => a.contents.length > 0)
  }

  const keywordHighlight = (
    text: string,
    keyword: string
  ): string | undefined => {
    if (!text || !keyword) {
      return text
    }
    // 将关键词拆分为字符数组
    const keywordChars = keyword.split('')
    // 创建正则表达式模式：每个字符后面可以跟0个或多个空格
    const pattern = keywordChars
      .map(
        (char) =>
          // 对特殊字符进行转义
          char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*'
      )
      .join('')
    // 构建正则表达式，使用捕获组来保留匹配的完整文本
    const regex = new RegExp(`(${pattern})`, 'gi')
    if (regex.test(text)) {
      // 替换匹配的文本
      return text.replace(regex, '<span class="active">$1</span>')
    }
    return ''
  }

  return flatLessons
    .map((lesson: string[]) => {
      const contents: string[] = lesson
        .slice(2)
        .map((text: string) => keywordHighlight(text, keyword))
        .filter(Boolean) as string[]
      return { idx: lesson[0], title: lesson[1], contents }
    })
    .filter((a: LessonSearch) => a.contents.length > 0)
}
