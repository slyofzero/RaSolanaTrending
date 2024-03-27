import { RPC_URL } from "@/utils/env";
import { ethers } from "ethers";
import Web3 from "web3";
import { RegisteredSubscription } from "web3/lib/commonjs/eth.exports";

export const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
export const web3: Web3<RegisteredSubscription> = new Web3(RPC_URL);
