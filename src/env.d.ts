/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string;
  readonly VITE_LOGS_WEBHOOK_URL?: string;
  // outras variáveis customizadas...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
