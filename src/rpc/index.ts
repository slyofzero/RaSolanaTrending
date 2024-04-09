import { RPC_URL } from "@/utils/env";
import { log } from "@/utils/handlers";
import { Connection } from "@solana/web3.js";

export let solanaConnection: Connection = null as unknown as Connection;

export function rpcConfig() {
  if (!RPC_URL) {
    log("RPC endpoint is undefined");
  }
  solanaConnection = new Connection(RPC_URL || "");
  log("RPC configured");
}
