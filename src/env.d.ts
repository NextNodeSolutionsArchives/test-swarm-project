/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly AUTH_ENABLED: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace NodeJS {
  interface ProcessEnv {
    JWT_SECRET?: string;
    NODE_ENV?: string;
    AUTH_ENABLED?: string;
  }
}
