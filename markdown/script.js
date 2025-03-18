// 获取 DOM 元素
const markdownInput = document.getElementById('markdown-input');
const previewOutput = document.getElementById('preview-output');

// 配置 marked.js
marked.setOptions({
  highlight: function (code, language) {
    // 使用 highlight.js 高亮代码块
    const validLanguage = highlightjs.getLanguage(language) ? language : 'plaintext';
    return highlightjs.highlight(code, { language: validLanguage }).value;
  },
});

// 监听输入框内容变化
markdownInput.addEventListener('input', (event) => {
  const markdownText = event.target.value;
  // 使用 marked.js 将 Markdown 转换为 HTML
  const htmlContent = marked.parse(markdownText);
  // 将渲染后的 HTML 显示在预览区域
  previewOutput.innerHTML = htmlContent;

  // 高亮代码块并添加行号
  hljs.highlightAll();
  hljs.initLineNumbersOnLoad();

  // 渲染数学公式
  if (window.MathJax) {
    MathJax.typeset();
  }
});