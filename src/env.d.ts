declare module "process" {
  global {
    // biome-ignore lint/style/useNamingConvention: @types/nodeの型定義を拡張しているため
    namespace NodeJS {
      interface ProcessEnv {
        // biome-ignore lint/style/useNamingConvention: 環境変数名の慣習のため
        DATABASE_URL: string;
      }
    }
  }
}
