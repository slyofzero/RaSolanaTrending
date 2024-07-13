declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production";
      TRENDING_BUY_BOT_API: string | undefined;
      BOT_TOKEN: string | undefined;
      BOT_USERNAME: string | undefined;
      ENCRYPTION_KEY: string | undefined;
      RPC_ENDPOINT: string | undefined;
      TOKEN_DATA_URL: string | undefined;
      CHANNEL_ID: string | undefined;
      DEX_URL: string | undefined;
      NETWORK_NAME: string | undefined;
      PORT: string | undefined;
      API_AUTH_KEY: string | undefined;
      TRENDING_PRICES: string | undefined;
      AD_PRICES: string | undefined;
      FIREBASE_PREFIX: string | undefined;
      TRENDING_CHANNEL_LINK: string | undefined;
      FIREBASE_KEY: string | undefined;
    }
  }
}

export {};
