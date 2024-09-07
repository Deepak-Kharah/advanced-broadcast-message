import { Config } from "../config";
import { EVENT_MANAGER_NAME } from "../event-manager/event-manager.constant";

export class Logger {
  prefix = EVENT_MANAGER_NAME;

  constructor(private config: Config) {
    this.log = this.log.bind(this);
    this.info = this.info.bind(this);
    this.debug = this.debug.bind(this);
    this.error = this.error.bind(this);
  }

  public log(...args: any[]) {
    console.log(this.prefix, ...args);
  }

  public info(...args: any[]) {
    console.info(this.prefix, ...args);
  }

  public debug(...args: any[]) {
    if (this.config.get("developmentConfig.debug")) {
      console.debug(this.prefix, "DEBUG:", ...args, this.getDebugOptions());
    }
  }

  public error(...args: any[]) {
    if (!this.config.get("developmentConfig.suppressErrors")) {
      console.error(this.prefix, ...args);
    }
  }

  private getDebugOptions() {
    return {
      // You can add more debug options here
    };
  }
}

export function getErrorMessage(message: string) {
  return EVENT_MANAGER_NAME + ": " + message;
}
