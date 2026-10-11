/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLOUD_ENDPOINT: string;
  readonly VITE_CLOUD_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
