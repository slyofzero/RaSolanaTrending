declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BOT_TOKEN: string | undefined;
      BOT_USERNAME: string | undefined;
      NODE_ENV: "development" | "production";
      FIREBASE_PREFIX: string | undefined;
      DEX_URL: string | undefined;
      FIREBASE_KEY: string | undefined;
      RPC_URL: string | undefined;
      ENCRYPTION_KEY: string | undefined;
      TOKEN_DATA_URL: string | undefined;
      CHANNEL_ID: string | undefined;
      PINNED_MSG_ID: string | undefined;
      NETWORK_NAME: string | undefined;
      LOGS_CHANNEL_ID: string | undefined;
    }
  }
}

export {};
