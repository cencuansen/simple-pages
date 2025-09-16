import { v4 as uuidv4 } from 'uuid'

export const newTextId = () => `i_${uuidv4().split('-')[4]}`


export const detectBrowser = () => {
  const ua = navigator.userAgent
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)

  // 桌面端检测
  if (!isMobile) return { type: 'desktop', browser: 'desktop' }

  // 安卓浏览器检测
  if (/Android/i.test(ua)) {
    if (/Chrome\/[\d.]+ Mobile/i.test(ua) && !/EdgA\/[\d.]+/.test(ua)) {
      return { type: 'android', browser: 'chrome' }
    }
    if (/EdgA\/[\d.]+/.test(ua)) {
      return { type: 'android', browser: 'edge' }
    }
    return { type: 'android', browser: 'other' }
  }

  return { type: 'other', browser: 'unknown' }
}

export const isNumber = (value: number | null | undefined) => {
  return typeof value === 'number' && Number.isFinite(value)
}
