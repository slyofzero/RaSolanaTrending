import { PairsData, WSSPairData } from "@/types";
import { TokenPoolData } from "@/types/terminalData";
import { TrendingData, TrendingTokens } from "@/types/trending";
import { apiFetcher } from "@/utils/api";
import { COINGECKO_API_KEY, TOKEN_DATA_URL } from "@/utils/env";
import { log } from "@/utils/handlers";
import {
  previouslyTrendingTokens,
  setTopTrendingTokens,
  toTrendTokens,
} from "@/vars/trending";

export async function processTrendingPairs(pairs: WSSPairData[]) {
  const newTopTrendingTokens: TrendingTokens = [];

  for (const pair of pairs.slice(0, 30)) {
    if (newTopTrendingTokens.length >= 20) break;

    try {
      const { baseToken } = pair;
      const { address } = baseToken;

      const pairData = await apiFetcher<TokenPoolData>(
        `https://pro-api.coingecko.com/api/v3/onchain/networks/ton/tokens/${address}/pools`,
        { "x-cg-pro-api-key": COINGECKO_API_KEY || "" }
      );

      const tokenAlreadyInTop15 = newTopTrendingTokens.some(
        ([token]) => token === address
      );

      const firstPair = pairData.data.data?.at(0);
      if (!firstPair || tokenAlreadyInTop15) continue;

      newTopTrendingTokens.push([address, firstPair]);
    } catch (error) {
      const err = error as Error;
      log(err.message);
      continue;
    }
  }

  for (const tokenData of toTrendTokens) {
    const { slot, token, socials } = tokenData;
    try {
      const alreadyTrendingRank = newTopTrendingTokens.findIndex(
        ([storedToken]) => storedToken === token
      );

      let slotRange = [1, 3];
      if (slot === 2) slotRange = [4, 10];
      else if (slot === 3) slotRange = [11, 20];

      const [min, max] = slotRange;
      const slotToTrend = Math.floor(Math.random() * (max - min + 1)) + min;

      if (alreadyTrendingRank !== -1) {
        if (slot < alreadyTrendingRank) {
          const [tokenData] = newTopTrendingTokens.splice(
            alreadyTrendingRank,
            1
          );
          newTopTrendingTokens.splice(slotToTrend, 0, tokenData);
        }
        continue;
      }

      const pairData = await apiFetcher<TokenPoolData>(
        `https://pro-api.coingecko.com/api/v3/onchain/networks/ton/tokens/${token}/pools`,
        { "x-cg-pro-api-key": COINGECKO_API_KEY || "" }
      );

      // const pairData = await apiFetcher<PairsData>(
      //   `${TOKEN_DATA_URL}/${token}`
      // );
      const firstPair = pairData.data.data?.at(0);
      if (!firstPair) {
        log(`Pair not found for ${token}`);
        continue;
      }
      const newTrendingPair: [string, TrendingData] = [
        token,
        { ...firstPair, socials },
      ];
      newTopTrendingTokens.splice(slotToTrend - 1, 0, newTrendingPair);
    } catch (error) {
      const err = error as Error;
      log(err.message);
      continue;
    }
  }

  setTopTrendingTokens(newTopTrendingTokens);

  if (previouslyTrendingTokens.length !== newTopTrendingTokens.length) {
    log(
      `Trending tokens set, tokens trending now - ${newTopTrendingTokens.length}`
    );
  }
}
