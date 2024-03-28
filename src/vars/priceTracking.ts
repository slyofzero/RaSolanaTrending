export interface TokenMCTracking {
  [key: string]: {
    initialMC: number;
    pastBenchmark: number;
  };
}

export const tokenMCTracking: TokenMCTracking = {};
