interface Token {
  address: string;
  name: string;
  symbol: string;
}

interface TransactionStats {
  buys: number;
  sells: number;
}

interface Txns {
  m5: TransactionStats;
  h1: TransactionStats;
  h6: TransactionStats;
  h24: TransactionStats;
}

interface Volume {
  m5: number;
  h1: number;
  h6: number;
  h24: number;
}

interface PriceChange {
  m5: number;
  h1: number;
  h6: number;
  h24: number;
}

interface Liquidity {
  usd: number;
  base: number;
  quote: number;
}

interface Profile {
  eti: boolean;
  header: boolean;
  website: boolean;
  twitter: boolean;
  linkCount: number;
  imgKey: string;
}

export interface WSSPairData {
  chainId: string;
  dexId: string;
  pairAddress: string;
  baseToken: Token;
  quoteToken: Token;
  quoteTokenSymbol: string;
  price: string;
  priceUsd: string;
  txns: Txns;
  buyers: Volume;
  sellers: Volume;
  makers: Volume;
  volume: Volume;
  volumeBuy: Volume;
  volumeSell: Volume;
  priceChange: PriceChange;
  liquidity: Liquidity;
  marketCap: number;
  pairCreatedAt: number;
  eti: boolean;
  profile: Profile;
  c: string;
  a: string;
}
