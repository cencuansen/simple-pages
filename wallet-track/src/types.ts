export interface CommonExport {
  name: string
  address: string
  emoji: string
  toast: boolean
  bubble: boolean
  feed: boolean
  groups: Array<string>
  sound: string
}

export interface BullxExport {
  name: string
  address: string
  emoji: string
}

export interface AxiomExport {
  trackedWalletAddress: string
  name: string
  emoji: string
  alertsOnToast: boolean
  alertsOnBubble: boolean
  alertsOnFeed: boolean
  groups: Array<string>
  sound: string
}

export interface GmgnExport {
  name: string
  address: string
  emoji: string
}

export interface OkxExport {}
