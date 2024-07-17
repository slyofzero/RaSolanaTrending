import { PairData, PairsData } from "@/types";
import { TokenPoolData } from "@/types/terminalData";
import { TrendingTokens } from "@/types/trending";
import { apiFetcher, syncTrendingBuyBot } from "@/utils/api";
import { TOKEN_DATA_URL } from "@/utils/env";
import { log } from "@/utils/handlers";
import {
  previouslyTrendingTokens,
  setTopTrendingTokens,
  toTrendTokens,
} from "@/vars/trending";

export async function processTrendingPairs() {
  const newTopTrendingTokens: TrendingTokens = [];

  const trendingTokens = await apiFetcher<TokenPoolData>(
    `https://api.geckoterminal.com/api/v2/networks/solana/trending_pools?page=1`
  );

  if (!trendingTokens) return;

  for (const tokenData of trendingTokens.data.data) {
    if (newTopTrendingTokens.length >= 15) break;
    const { quote_token, base_token } = tokenData.relationships;
    quote_token.data.id;
    const address = base_token.data.id.replace("solana_", "");
    const pairData = await apiFetcher<PairsData>(
      `${TOKEN_DATA_URL}/${address}`
    );

    const tokenAlreadyInTop15 = newTopTrendingTokens.some(
      ([token]) => token === address
    );

    const firstPair = pairData?.data.pairs.at(0);
    if (!firstPair || tokenAlreadyInTop15) continue;

    newTopTrendingTokens.push([address, firstPair]);
  }

  // let mcLimit = MCLimit;
  // while (mcLimit <= 10_000_000) {
  //   for (const pair of pairs) {
  //     // Only need 10 tokens at the top
  //     if (newTopTrendingTokens.length >= 15) break;

  //     const { baseToken, marketCap } = pair;

  //     if (marketCap > mcLimit) continue;

  //     const { address } = baseToken;
  //     const pairData = await apiFetcher<PairsData>(
  //       `${TOKEN_DATA_URL}/${address}`
  //     );

  //     if (!pairData) continue;

  //     const tokenAlreadyInTop15 = newTopTrendingTokens.some(
  //       ([token]) => token === address
  //     );

  //     const firstPair = pairData.data.pairs.at(0);
  //     if (!firstPair || tokenAlreadyInTop15) continue;

  //     newTopTrendingTokens.push([address, firstPair]);
  //   }

  //   mcLimit *= 2;
  // }

  for (const { slot, token } of toTrendTokens) {
    const alreadyTrendingRank = newTopTrendingTokens.findIndex(
      ([storedToken]) => storedToken === token
    );

    let slotRange = [1, 3];
    if (slot === 2) slotRange = [1, 8];
    else if (slot === 3) slotRange = [1, 15];

    const [min, max] = slotRange;
    const slotToTrend = Math.floor(Math.random() * (max - min + 1)) + min;
    if (alreadyTrendingRank !== -1) {
      if (slotToTrend < alreadyTrendingRank) {
        const [tokenData] = newTopTrendingTokens.splice(alreadyTrendingRank, 1);
        newTopTrendingTokens.splice(slotToTrend, 0, tokenData);
      }
      continue;
    }

    const pairData = await apiFetcher<PairsData>(`${TOKEN_DATA_URL}/${token}`);
    const firstPair = pairData?.data.pairs.at(0);
    if (!firstPair) continue;
    const newTrendingPair: [string, PairData] = [token, firstPair];
    newTopTrendingTokens.splice(slotToTrend - 1, 0, newTrendingPair);
  }

  setTopTrendingTokens(newTopTrendingTokens);

  if (previouslyTrendingTokens.length !== newTopTrendingTokens.length) {
    log(
      `Trending tokens set, tokens trending now - ${newTopTrendingTokens.length}`
    );
  }

  for (const [token] of newTopTrendingTokens) {
    if (!previouslyTrendingTokens.includes(token)) {
      log(`${token} added to trending list`);
      syncTrendingBuyBot();
      break;
    }
  }
}
