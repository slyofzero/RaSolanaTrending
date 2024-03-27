import { apiFetcher } from "@/utils/api";
import { errorHandler } from "@/utils/handlers";

export let ethPrice = 0;

export async function getEthPrice() {
  try {
    const data = (
      await apiFetcher(
        "https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT"
      )
    ).data as any;
    ethPrice = Number(data.price);
  } catch (error) {
    errorHandler(error);
  }
}
