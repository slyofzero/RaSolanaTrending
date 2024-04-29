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
  log(`Error: ${error.message}`);
  // eslint-disable-next-line
  console.trace();
}
