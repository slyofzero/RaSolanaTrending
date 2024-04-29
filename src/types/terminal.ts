type Pool = {
  id: string;
  type: string;
  attributes: {
    base_token_price_usd: string;
    base_token_price_native_currency: string;
    quote_token_price_usd: string;
    quote_token_price_native_currency: string;
    base_token_price_quote_token: string;
    quote_token_price_base_token: string;
    address: string;
    name: string;
    pool_created_at: string;
    fdv_usd: string;
    market_cap_usd: string | null;
    price_change_percentage: {
      m5: string;
      h1: string;
      h6: string;
      h24: string;
    };
    transactions: {
      m5: {
        buys: number;
        sells: number;
        buyers: number;
        sellers: number;
      };
      m15: {
        buys: number;
        sells: number;
        buyers: number;
        sellers: number;
      };
      m30: {
        buys: number;
        sells: number;
        buyers: number;
        sellers: number;
      };
      h1: {
        buys: number;
        sells: number;
        buyers: number;
        sellers: number;
      };
      h24: {
        buys: number;
        sells: number;
        buyers: number;
        sellers: number;
      };
    };
    volume_usd: {
      m5: string;
      h1: string;
      h6: string;
      h24: string;
    };
    reserve_in_usd: string;
  };
  relationships: {
    base_token: {
      data: {
        id: string;
        type: string;
      };
    };
    quote_token: {
      data: {
        id: string;
        type: string;
      };
    };
    dex: {
      data: {
        id: string;
        type: string;
      };
    };
  };
};

export type TerminalData = {
  data: Pool[];
};
