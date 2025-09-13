export interface SpeakerStyle {
  id: number
  name: string
}

export interface Speaker {
  name: string
  styles: SpeakerStyle[]
}

export interface VoiceVoxInfo {
  status: string
  message: string
}