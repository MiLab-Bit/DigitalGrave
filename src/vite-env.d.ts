/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CF_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
