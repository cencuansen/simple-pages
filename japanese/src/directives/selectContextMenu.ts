import { type App, createApp, type ObjectDirective } from 'vue'

import TextSelectionMenu from '../components/TextSelectionMenu/TextSelectionMenu.vue'

export const selectContextMenuEnhanced: ObjectDirective<HTMLElement> = {
  mounted(el: HTMLElement) {
    let menuApp: App<Element> | null = null
    let menuContainer: HTMLElement | null = null

    const showMenu = (
      x: number,
      y: number,
      w: number,
      h: number,
      selectedText: string
    ) => {
      // 如果已有菜单，先移除
      hideMenu()

      // 创建菜单容器
      menuContainer = document.createElement('div')
      document.body.appendChild(menuContainer)

      // 创建Vue应用实例
      menuApp = createApp(TextSelectionMenu, {
        selectedText,
        x,
        y,
        width: w,
        height: h,
      })

      // 挂载菜单
      menuApp.mount(menuContainer)
    }

    const hideMenu = () => {
      if (menuApp) {
        menuApp.unmount()
        menuApp = null
      }
      if (menuContainer) {
        document.body.removeChild(menuContainer)
        menuContainer = null
      }
    }

    const handleTextSelection = (_: Event) => {
      const selection = window.getSelection()
      const selectedText = selection?.toString().trim() || ''

      if (!selection || !selectedText) {
        hideMenu()
        return
      }

      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()

      const menuWidth: number = 200
      const menuHeight: number = 300
      const viewportWidth = document.body.clientWidth
      const viewportHeight = window.scrollY + document.body.clientHeight

      let x = rect.left
      let y_top = rect.top + window.scrollY
      let y = rect.bottom + window.scrollY

      if (x + menuWidth > viewportWidth) {
        x = x - menuWidth
      }
      if (y + menuHeight > viewportHeight) {
        y = y_top - menuHeight
      }

      showMenu(x, y, menuWidth, menuHeight, selectedText)
    }

    el.addEventListener('mouseup', handleTextSelection)
    el.addEventListener('touchend', handleTextSelection)

    const hideOnScroll = () => hideMenu()
    window.addEventListener('scroll', hideOnScroll, true)
    window.addEventListener('resize', hideOnScroll)

    el._selectContextMenu = {
      handleTextSelection,
      hideOnScroll,
      cleanup: () => {
        hideMenu()
      },
    }
  },

  unmounted(el: HTMLElement) {
    if (el._selectContextMenu) {
      el.removeEventListener(
        'mouseup',
        el._selectContextMenu.handleTextSelection
      )
      window.removeEventListener(
        'scroll',
        el._selectContextMenu.hideOnScroll,
        true
      )
      window.removeEventListener('resize', el._selectContextMenu.hideOnScroll)
      el._selectContextMenu.cleanup()
    }
  },
}

// 扩展 HTMLElement 类型
declare global {
  interface HTMLElement {
    _selectContextMenu?: {
      handleTextSelection: (event: MouseEvent) => void
      hideOnScroll: () => void
      cleanup: () => void
    }
  }
}
