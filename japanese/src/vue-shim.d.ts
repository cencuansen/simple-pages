import { ComponentCustomProperties } from 'vue'

declare module 'vue' {
  interface ComponentCustomProperties {
    $ELEMENT: {
      size: 'small' | 'default' | 'large'
    }
  }
}

// 扩展 Window 接口
declare global {
  interface Window {
    $ELEMENT?: {
      size: 'small' | 'default' | 'large'
    }
  }
}