import { getDocument } from "@/firebase";
import { StoredToTrend, TrendingTokens } from "@/types/trending";
import { log } from "@/utils/handlers";

export let trendingTokens: TrendingTokens = [];
export let previouslyTrendingTokens: string[] = [];

// Related to paid trending tokens
export let toTrendTokens: StoredToTrend[] = [];
export function setTopTrendingTokens(newTrendingTokens: TrendingTokens) {
  previouslyTrendingTokens = trendingTokens.map(([token]) => token);
  trendingTokens = newTrendingTokens;
}

export async function syncToTrend() {
  const newToTrendTokens = await getDocument<StoredToTrend>({
    collectionName: "to_trend",
    queries: [["status", "in", ["PAID", "MANUAL"]]],
  });

  toTrendTokens = newToTrendTokens.sort((a, b) => a.slot - b.slot);

  log(`Synced to_trend data`);
}
