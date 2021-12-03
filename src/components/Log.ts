import singleton from "https://raw.githubusercontent.com/grevend/singleton/main/mod.ts";
import { CONFIG } from "../config.js";

/**
 * The level of logging. the higher the level the more important the log is.
 */
export enum LogLevel {
  hidden,
  low,
  medium,
  high,
  extreme,
}
export enum LogType {
  info,
  error,
}
/**
 * The shape used to log messages using the custom Log class.
 */
interface LogShape {
  type?: LogType;
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
  private printLog(data: LogShape) {
    const logF = data.type === LogType.error ? console.error : console.log;
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
        if (CONFIG.logLevel >= data.level) {
          switch (data.level) {
            case LogLevel.hidden:
              this.pushLog(data, false);
              break;
            default:
              this.pushLog(data, CONFIG.printLogToConsole);
          }
        }
        res();
      }, 0);
    });
  }

  public static info(t: LogShape) {
    return $Log.getInstance().log({ type: LogType.info, timeStamp: Date.now(), ...t });
  }
  public static error(t: LogShape) {
    return $Log.getInstance().log({ type: LogType.error, timeStamp: Date.now(), ...t });
  }

  /**
   * Runs te provided method while catching for any errors, if an error is found it is logged silently (not displayed) to the logger.
   * @returns returns any value returned by the method, null otherwise.
   */
  public static silent<I>(x: () => I): I | null {
    try {
      return x();
    } catch (e) {
      Log.error({ level: LogLevel.hidden, message: e });
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
