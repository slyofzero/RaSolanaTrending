import { teleBot } from "..";
import { LOGS_CHANNEL_ID } from "./env";
import { getNow } from "./time";

export function log(message: string) {
  // eslint-disable-next-line no-console
  console.log(`[-----${getNow()}-----]`, message);
}

export function stopScript(message: string, exitCode?: number) {
  log(message);
  process.exit(exitCode || 1);
}

export function errorHandler(e: unknown) {
  const error = e as Error;
  const errorText = `Error: ${error.message}`;
  log(`Error: ${error.message}`);

  teleBot.api.sendMessage(LOGS_CHANNEL_ID || "", errorText).catch((e) => {
    const error = e as Error;
    // eslint-disable-next-line
    console.log(`Error while sending log msg: ${error.message}`);
  });
}
