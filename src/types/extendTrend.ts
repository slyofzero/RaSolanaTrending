import { Timestamp } from "firebase-admin/firestore";

export interface StoredExtendTrend {
  hash: string;
  trendOrder: string;
  duration: number;
  amount: number;
  sentTo: string;
  status: "PENDING" | "PAID" | "EXPIRED" | "MANUAL";
  username: string;
  paidAt: Timestamp;
}
