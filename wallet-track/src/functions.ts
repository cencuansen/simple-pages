// @ts-nocheck

import type { Common, Bullx, Axiom } from './types.ts'
import { all as allEmojis } from './emojis-all.ts'

export const fromBullx = (params: string): Common[] => {
  const addressSet = new Set<string>()
  const list = JSON.parse(params)
  const isValid = list[0].hasOwnProperty('address')
  if (!isValid) {
    // return fromAxiom(params)
    return []
  }
  const emojis = shuffle(allEmojis.slice())
  return list
    .map(
      item =>
        ({
          name: item.name,
          address: item.address,
          emoji: item.emoji || emojis.shift(),
          toast: false,
          bubble: true,
          feed: true,
          groups: [],
          sound: 'default'
        }) as unknown as Common
    )
    .filter(item => {
      if (addressSet.has(item.address)) {
        return false
      }
      addressSet.add(item.address)
      return true
    })
}
export const toBullx = (params: Common[]): string => {
  return JSON.stringify(
    params.map(
      param =>
        ({
          name: param.name,
          address: param.address,
          emoji: param.emoji
        }) as unknown as Bullx
    ),
    null,
    2
  )
}

export const fromGmgn = fromBullx
export const toGmgn = toBullx

export const fromAxiom = (params: string): Common[] => {
  const addressSet = new Set<string>()
  const list = JSON.parse(params)
  const isValid = list[0].hasOwnProperty('trackedWalletAddress')
  if (!isValid) {
    // return fromBullx(params)
    return []
  }
  const emojis = shuffle(allEmojis.slice())
  return list
    .map(
      item =>
        ({
          name: item.name,
          address: item.trackedWalletAddress,
          emoji: item.emoji || emojis.shift(),
          toast: item.alertsOnToast,
          bubble: item.alertsOnBubble,
          feed: item.alertsOnFeed,
          groups: item.groups,
          sound: item.sound
        }) as unknown as Common
    )
    .filter(item => {
      if (addressSet.has(item.address)) {
        return false
      }
      addressSet.add(item.address)
      return true
    })
}
export const toAxiom = (params: Common[]): string => {
  return JSON.stringify(
    params.map(
      param =>
        ({
          trackedWalletAddress: param.address,
          name: param.name,
          emoji: param.emoji,
          alertsOnToast: param.toast,
          alertsOnBubble: param.bubble,
          alertsOnFeed: param.feed,
          groups: param.groups,
          sound: param.sound
        }) as unknown as Axiom
    ),
    null,
    2
  )
}

export const fromOkx = (params: string): Common[] => {
  const addressSet = new Set<string>()
  try {
    // 如果入参是一个合法json，那么就不是 okx 的风格
    JSON.parse(params)
    // return fromAxiom(params)
    return []
  } catch (_) {}
  const emojis = shuffle(allEmojis.slice())
  return params
    .split('\n')
    .filter(line => line.trim() !== '') // 过滤空行
    .map(
      address =>
        ({
          name: address.slice(0, 5),
          address: address.trim(), // 去除前后空格
          emoji: emojis.shift(),
          toast: false,
          bubble: true,
          feed: true,
          groups: [],
          sound: 'default'
        }) as unknown as Common
    )
    .filter(item => {
      if (addressSet.has(item.address)) {
        return false
      }
      addressSet.add(item.address)
      return true
    })
}
export const toOkx = toBullx

export const shuffle = (array: number[] | string[]): number[] | string[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}
