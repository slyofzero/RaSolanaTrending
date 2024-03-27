import { PairData } from "@/types";
import { TrendingTokens } from "@/types/trending";
import { setTopTrendingTokens } from "@/vars/trending";

export async function processTrendingPairs(pairs: PairData[]) {
  const top15Pairs = pairs.slice(0, 15);
  const newTopTrendingTokens: TrendingTokens = [];

  for (const pair of top15Pairs) {
    const { baseToken } = pair;
    const { address } = baseToken;
    newTopTrendingTokens.push([address, pair]);
  }

  setTopTrendingTokens(newTopTrendingTokens);
}
