import { type Directive, type DirectiveBinding } from 'vue'

const vFocus: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    // 处理条件聚焦
    if (binding.value !== false) {
      handleFocus(el, binding)
    }
  },
  updated(el: HTMLElement, binding: DirectiveBinding) {
    // 值更新时重新判断
    if (binding.value !== false) {
      handleFocus(el, binding)
    }
  },
}

function handleFocus(el: HTMLElement, binding: DirectiveBinding) {
  // 支持延迟聚焦：v-focus:300
  const delay = binding.arg ? parseInt(binding.arg) : 0

  const focusFn = () => {
    // 检查元素类型
    if (el.nodeName === 'INPUT' || el.nodeName === 'TEXTAREA') {
      el.focus()
    } else {
      // 尝试在内部查找可聚焦元素
      const input = el.querySelector('input')
      const textarea = el.querySelector('textarea')
      if (input) input.focus()
      else if (textarea) textarea.focus()
      else el.focus() // 回退到元素本身
    }

    // 支持选中文本：v-focus.select
    if (binding.modifiers.select) {
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
        el.select()
      }
    }
  }

  // 应用延迟
  delay ? setTimeout(focusFn, delay) : focusFn()
}

export default vFocus
