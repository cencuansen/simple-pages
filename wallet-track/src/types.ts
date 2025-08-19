export interface Common {
  name: string
  address: string
  emoji: string
  toast: boolean
  bubble: boolean
  feed: boolean
  groups: Array<string>
  sound: string
}

export interface Bullx {
  name: string
  address: string
  emoji: string
}

export interface Axiom {
  trackedWalletAddress: string
  name: string
  emoji: string
  alertsOnToast: boolean
  alertsOnBubble: boolean
  alertsOnFeed: boolean
  groups: Array<string>
  sound: string
}

export interface Gmgn {
  name: string
  address: string
  emoji: string
}

export interface Okx {}
