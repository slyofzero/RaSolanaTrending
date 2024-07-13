import { log } from "@/utils/handlers";

export let lastEditted: string;
export let lastSentMessageId: number = 0;
export let trendingMessageId: number = 0;

export function setLastEditted(time: string) {
  lastEditted = time;
}

export function setLastSentMessageId(messageId: number) {
  lastSentMessageId = messageId;
  log(`Last sent message ID - ${messageId}`);
}

export function setTrendingMessageId(messageId: number) {
  trendingMessageId = messageId;
  log(`Set as trending message - ${messageId}`);
}
