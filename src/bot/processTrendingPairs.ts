import { PairData, PairsData, WSSPairData } from "@/types";
import { TrendingTokens } from "@/types/trending";
import { apiFetcher } from "@/utils/api";
import { TOKEN_DATA_URL } from "@/utils/env";
import { log } from "@/utils/handlers";
import { setTopTrendingTokens, toTrendTokens } from "@/vars/trending";

export async function processTrendingPairs(pairs: WSSPairData[]) {
  const top15Pairs = pairs.slice(0, 15);
  const newTopTrendingTokens: TrendingTokens = [];

  for (const pair of top15Pairs) {
    const { baseToken } = pair;
    const { address } = baseToken;
    const pairData = await apiFetcher<PairsData>(
      `${TOKEN_DATA_URL}/${address}`
    );
    const firstPair = pairData.data.pairs.at(0);
    if (!firstPair) continue;

    newTopTrendingTokens.push([address, firstPair]);
  }

  for (const { slot, token } of toTrendTokens) {
    const pairData = await apiFetcher<PairsData>(`${TOKEN_DATA_URL}/${token}`);
    const firstPair = pairData.data.pairs.at(0);
    if (!firstPair) continue;
    const newTrendingPair: [string, PairData] = [token, firstPair];
    newTopTrendingTokens.splice(slot - 1, 0, newTrendingPair);
  }

  setTopTrendingTokens(newTopTrendingTokens);
  log(
    `Trending tokens set, tokens trending now - ${newTopTrendingTokens.length}`
  );
}
