import singleton from "https://raw.githubusercontent.com/grevend/singleton/main/mod.ts";
import { CONFIG } from "../config.js";

/**
 * The level of logging. the higher the level the more important the log is.
 */
export enum LogLevel {
  info,
  warning,
  error,
}

/**
 * The shape used to log messages using the custom Log class.
 */
interface LogShape {
  timeStamp?: string | number;
  level: LogLevel;
  message: string;
}
export class Log {
  private logs: LogShape[] = [];

  /**
   * The constructor for the Log class. Use the static methods to log messages.
   */
  constructor() {}
  private logFunction(level: LogLevel){
    switch(level){
      case LogLevel.error: return console.error;
      case LogLevel.info: return console.info;
      case LogLevel.warning: return console.warn;
    }
  }
  private printLog(data: LogShape) {
    const logF = this.logFunction(data.level);
    logF(`[${new Date(data.timeStamp || Date.now())}] - ${data.level} - ${data.message}`);
  }
  private pushLog(data: LogShape, print = false) {
    this.logs.push(data);
    if (this.logs.length > CONFIG.logSizeLimit) this.logs.shift();
    if (print) this.printLog(data);
  }
  private log(data: LogShape) {
    return new Promise<void>((res) => {
      setTimeout(() => {
        if (CONFIG.logLevel >= data.level) this.pushLog(data, CONFIG.printLogToConsole);
        res();
      }, 0);
    });
  }

  public static info(message: string) {
    return $Log.getInstance().log({ level: LogLevel.info, message, timeStamp: Date.now()});
  }
  public static warning(message: string) {
    return $Log.getInstance().log({ level: LogLevel.warning, message, timeStamp: Date.now()});
  }
  public static error(message: string) {
    return $Log.getInstance().log({ level: LogLevel.error, message, timeStamp: Date.now()});
  }

  /**
   * Runs te provided method while catching for any errors, if an error is found it is logged silently (not displayed) to the logger.
   * @returns returns any value returned by the method, null otherwise.
   */
  public static silent<I>(x: () => I): I | null {
    try {
      return x();
    } catch (e) {
      Log.error(e);
    }
    return null;
  }

  /**
   * @returns all the messages stored in the Logs storage. flushes the storage.
   */
  public getAllLogs() {
    return this.logs;
  }

  /**
   * Says it all....
   */
  static clearLogs() {
    Log.getInstance().logs = [];
  }

  static getInstance() {
    return $Log.getInstance();
  }
}

export const $Log = singleton(() => new Log());
