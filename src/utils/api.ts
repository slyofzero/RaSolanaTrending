import { TRENDING_BUY_BOT_API } from "./env";
import { errorHandler, log } from "./handlers";

export async function apiFetcher<T>(
  url: string,
  headerObj?: Record<string, string>
) {
  try {
    const headers = new Headers(headerObj);
    headers.append("accept", "application/json");
    const response = await fetch(url, { headers });
    const data = (await response.json()) as T;
    return { response: response.status, data };
  } catch (error) {
    return null;
  }
}

export async function apiPoster<T>(url: string) {
  const response = await fetch(url, { method: "POST" });
  const data = (await response.json()) as T;
  return { response: response.status, data };
}

export async function syncTrendingBuyBot() {
  log(`Sent sync request`);

  try {
    await apiPoster(`${TRENDING_BUY_BOT_API}/syncTrending`);
  } catch (error) {
    errorHandler(error);
  }
}
