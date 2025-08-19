// @ts-nocheck

import type { Common, Axiom } from './types.ts'

export const fromBullx = (params: string): Common[] => {
  return []
}
export const toBullx = (params: Common[]): string => {
  return ''
}

export const fromAxiom = (params: string): Common[] => {
  return []
}
export const toAxiom = (params: Common[]): string => {
  return JSON.stringify(params
    .map(param => {
      return {
        trackedWalletAddress: param.address,
        name: param.name,
        emoji: param.emoji,
        alertsOnToast: param.toast,
        alertsOnBubble: param.bubble,
        alertsOnFeed: param.feed,
        groups: param.groups,
        sound: param.sound
      } as unknown as Axiom
    }), null, 2)
}

export const fromGmgn = (params: string): Common[] => {
  return []
}
export const toGmgn = (params: Common[]): string => {
  return ''
}

export const fromOkx = (params: string): Common[] => {
  return params.split('\n').map(address => {
    return {
      name: address.slice(0, 5),
      address: address,
      emoji: null,
      toast: false,
      bubble: true,
      feed: true,
      groups: [],
      sound: 'default'
    } as unknown as Common
  })
}
export const toOkx = (params: Common[]): string => {
  return ''
}
