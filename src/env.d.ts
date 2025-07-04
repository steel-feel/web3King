

interface ImportMetaEnv {
    // import.meta.env.PUBLIC_FOO
    readonly RELAYER_PVT_KEY: string;
    readonly EOA_PVT_KEY: string;
    readonly RELAYER_SERVER_URL: string;
  }
  
interface ImportMeta {
    readonly env: ImportMetaEnv;
  }