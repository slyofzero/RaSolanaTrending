import { getDocument } from "@/firebase";
import { StoredAdvertisement } from "@/types/advertisement";
import { log } from "@/utils/handlers";

export let advertisements: StoredAdvertisement[] = [];

export async function syncAdvertisements() {
  advertisements = await getDocument<StoredAdvertisement>({
    collectionName: "advertisements",
    queries: [["status", "in", ["PAID", "MANUAL"]]],
  });

  log("Synced advertisements with firebase");
}
