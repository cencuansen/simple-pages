export interface Props {
  bind: string
  position?: 'left' | 'right' | 'top' | 'bottom'
  highlightColor?: string
  hoverColor?: string
}

export interface ElementInfo {
  key: string
  ele: Element | null

  [key: string]: any
}
