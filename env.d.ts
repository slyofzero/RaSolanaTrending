declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BOT_TOKEN: string | undefined;
      BOT_USERNAME: string | undefined;
      NODE_ENV: "development" | "production";
      FIREBASE_PREFIX: string | undefined;
      DEX_URL: string | undefined;
      FIREBASE_KEY: string | undefined;
      RPC_ENDPOINT: string | undefined;
      ENCRYPTION_KEY: string | undefined;
      TOKEN_DATA_URL: string | undefined;
      CHANNEL_ID: string | undefined;
      PINNED_MSG_ID: string | undefined;
      NETWORK_NAME: string | undefined;
      LOGS_CHANNEL_ID: string | undefined;
      PAYMENT_LOGS_CHANNEL_ID: string | undefined;
      API_AUTH_KEY: string | undefined;
      MAIN_ADDRESS: string | undefined;
      PORT: string | undefined;
      BUY_BOT_API: string | undefined;
      TRENDING_PRICES: string | undefined;
      AD_PRICES: string | undefined;
      COINGECKO_API_KEY: string | undefined;
      BANNED_TOKENS: string | undefined;
      TRENDING_BUY_BOT_API: string | undefined;
      TRENDING_MESSAGE: string | undefined;
    }
  }
}

export {};
