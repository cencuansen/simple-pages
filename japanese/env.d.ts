interface ImportMetaEnv {
  readonly VITE_AUDIO_BASE: string
  readonly VITE_JSON_BASE: string
  // 其他配置
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
