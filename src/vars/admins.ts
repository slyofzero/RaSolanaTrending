import { getDocument } from "@/firebase";
import { StoredAdmin } from "@/types";
import { log } from "@/utils/handlers";

export let admins: StoredAdmin[] = [];

export async function syncAdmins() {
  admins = await getDocument<StoredAdmin>({
    collectionName: "admins",
  });

  log("Synced admins with firebase");
}
