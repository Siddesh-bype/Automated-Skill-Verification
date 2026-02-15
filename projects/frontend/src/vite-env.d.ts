/// <reference types="vite/client" />

declare namespace JSX {
  interface IntrinsicElements {
    'spline-viewer': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & { url?: string },
      HTMLElement
    >
  }
}

interface ImportMetaEnv {
  readonly VITE_ENVIRONMENT: string

  readonly VITE_ALGOD_TOKEN: string
  readonly VITE_ALGOD_SERVER: string
  readonly VITE_ALGOD_PORT: string
  readonly VITE_ALGOD_NETWORK: string

  readonly VITE_INDEXER_TOKEN: string
  readonly VITE_INDEXER_SERVER: string
  readonly VITE_INDEXER_PORT: string

  readonly VITE_KMD_TOKEN: string
  readonly VITE_KMD_SERVER: string
  readonly VITE_KMD_PORT: string
  readonly VITE_KMD_PASSWORD: string
  readonly VITE_KMD_WALLET: string
  readonly VITE_PINATA_JWT?: string
  readonly VITE_PINATA_GATEWAY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
