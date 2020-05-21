import { Logger } from "./logger";

export class ConsoleLogger implements Logger {
  log(message: string) {
    console.log(message);
  }

  error(message: string, details?: { [key: string]: any }) {
    console.error(message, details);
  }
}
