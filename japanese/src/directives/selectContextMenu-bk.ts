// directives/selectContextMenuEnhanced.ts
import type { DirectiveBinding, ObjectDirective } from 'vue'

interface MenuItem {
  label: string
  action: (selectedText: string, event: MouseEvent) => void
  icon?: string
  disabled?: boolean
  divider?: boolean
}

interface SelectContextMenuBinding {
  menuItems: MenuItem[]
  menuClass?: string
  maxWidth?: number
  onBeforeShow?: (selectedText: string) => boolean
}

export const selectContextMenuEnhanced: ObjectDirective<
  HTMLElement,
  SelectContextMenuBinding
> = {
  mounted(
    el: HTMLElement,
    binding: DirectiveBinding<SelectContextMenuBinding>
  ) {
    let menuElement: HTMLElement
    let lastSelection = ''

    const createMenu = (): HTMLElement => {
      const menu = document.createElement('div')
      menu.className = binding.value.menuClass || 'text-selection-menu'
      menu.style.cssText = `
        position: fixed;
        background: var(--el-bg-color);
        border: 1px solid var(--el-border-color-light);
        border-radius: 6px;
        padding: 6px 0;
        z-index: 10000;
        display: none;
        min-width: 140px;
        max-width: ${binding.value.maxWidth || 200}px;
        opacity: 0;
        transform: translateY(-10px);
        transition: opacity 0.15s ease, transform 0.15s ease;
      `
      return menu
    }

    const showMenu = (x: number, y: number, selectedText: string) => {
      // 检查是否应该显示菜单
      if (
        binding.value.onBeforeShow &&
        !binding.value.onBeforeShow(selectedText)
      ) {
        return
      }

      if (!menuElement) {
        menuElement = createMenu()
        document.body.appendChild(menuElement)
      }

      menuElement.innerHTML = ''

      binding.value.menuItems.forEach((item, _) => {
        if (item.divider) {
          const divider = document.createElement('div')
          divider.style.cssText = `
            height: 1px;
            background: #e2e8f0;
            margin: 4px 0;
          `
          menuElement!.appendChild(divider)
          return
        }

        const menuItem = document.createElement('div')
        menuItem.className = `menu-item ${item.disabled ? 'disabled' : ''}`
        menuItem.style.cssText = `
          padding: 8px 16px;
          cursor: ${item.disabled ? 'not-allowed' : 'pointer'};
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: inherit;
          transition: background-color 0.1s ease;
        `

        menuItem.innerHTML = item.icon
          ? `<span style="font-size: 16px;">${item.icon}</span> ${item.label}`
          : item.label

        if (!item.disabled) {
          menuItem.onclick = (e) => {
            e.stopPropagation()
            item.action(selectedText, e as MouseEvent)
            hideMenu()
          }

          menuItem.onmouseenter = () => {
            menuItem.style.background = 'var(--el-bg-color-overlay)'
          }
          menuItem.onmouseleave = () => {
            menuItem.style.background = 'var(--el-bg-color)'
          }
        }

        menuElement.appendChild(menuItem)
      })

      // 确保菜单在视口内
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const menuRect = menuElement.getBoundingClientRect()

      let finalX = x
      let finalY = y

      if (x + menuRect.width > viewportWidth) {
        finalX = viewportWidth - menuRect.width - 10
      }
      if (y + menuRect.height > viewportHeight) {
        finalY = viewportHeight - menuRect.height - 10
      }

      menuElement.style.left = `${finalX}px`
      menuElement.style.top = `${finalY}px`
      menuElement.style.display = 'block'

      // 触发动画
      requestAnimationFrame(() => {
        if (menuElement) {
          menuElement.style.opacity = '1'
          menuElement.style.transform = 'translateY(0)'
        }
      })

      setTimeout(() => {
        document.addEventListener('click', hideMenuOnClick, true)
      }, 0)
    }

    const hideMenu = () => {
      if (menuElement) {
        menuElement.style.opacity = '0'
        menuElement.style.transform = 'translateY(-10px)'

        setTimeout(() => {
          if (menuElement) {
            menuElement.style.display = 'none'
          }
        }, 150)
      }
      document.removeEventListener('click', hideMenuOnClick, true)
    }

    const hideMenuOnClick = (e: MouseEvent) => {
      if (menuElement && !menuElement.contains(e.target as Node)) {
        hideMenu()
      }
    }

    const handleTextSelection = (event: MouseEvent) => {
      // 如果按住了 Ctrl 键或右键，不显示自定义菜单
      if (event.ctrlKey || event.button === 2) {
        return
      }

      const selection = window.getSelection()
      const selectedText = selection?.toString().trim() || ''

      if (
        selection &&
        selectedText &&
        selectedText !== lastSelection &&
        selection.rangeCount > 0
      ) {
        lastSelection = selectedText

        const range = selection.getRangeAt(0)
        const rect = range.getBoundingClientRect()

        showMenu(rect.left, rect.bottom + window.scrollY + 8, selectedText)
      } else if (!selectedText) {
        hideMenu()
      }
    }

    el.addEventListener('mouseup', handleTextSelection)

    const hideOnScroll = () => hideMenu()
    window.addEventListener('scroll', hideOnScroll, true)
    window.addEventListener('resize', hideOnScroll)

    el._selectContextMenu = {
      handleTextSelection,
      hideOnScroll,
      cleanup: () => {
        if (menuElement) {
          document.body.removeChild(menuElement)
        }
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
