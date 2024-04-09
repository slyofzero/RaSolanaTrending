import { getDocument } from "@/firebase";
import { StoredReferral } from "@/types";

export async function referralAddressRepeated(address: string) {
  const [referralData] = await getDocument<StoredReferral>({
    collectionName: "referral",
    queries: [["walletAddress", "==", address]],
  });

  return referralData;
}
