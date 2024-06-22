export interface TokenMCTracking {
  [key: string]: {
    initialMC: number;
    pastBenchmark: number;
    messageId: number;
  };
}

export const tokenMCTracking: TokenMCTracking = {};
