import singleton from "https://raw.githubusercontent.com/grevend/singleton/main/mod.ts";
import { CONFIG } from "../config.js";

/**
 * The level of logging. the higher the level the more important the log is.
 */
export enum LogLevel {
    hidden, low, medium, high, extreme
}
export enum LogType {
    info, error
}
/**
 * The shape used to log messages using the custom Log class.
 */
interface LogShape {
    type?: LogType
    level: LogLevel,
    message: string
}
export class Log {
    private logThread: Worker;

    /**
     * The constructor for the Log class. Use the static methods to log messages.
     */
    constructor(){
        this.logThread = new Worker(new URL("../MISC/Threads/LoggingThread.js", import.meta.url).href, { type: "module" });
        this.logThread.postMessage({config: true, ...CONFIG});
    }
    public static info(t: LogShape){ $Log.getInstance().logThread.postMessage({type: LogType.info, ...t}) }
    public static error(t: LogShape){ $Log.getInstance().logThread.postMessage({type: LogType.error, ...t}) }

    /**
     * Runs te provided method while catching for any errors, if an error is found it is logged silently (not displayed) to the logger.
     * @returns returns any value returned by the method, null otherwise.
     */
    public static silent<I>(x: ()=>I): I | null {
        try{return x()}catch(e){Log.error({level: LogLevel.hidden, message: e})}
        return null;
    }

    /**
     * @returns all the messages stored in the Logs storage. flushes the storage.
     */
    public getAllLogs(){
        return new Promise<LogShape[]>((res,_rej)=>{
            this.logThread.onmessage = ((e: MessageEvent<LogShape[]>) => {
                res(e.data);
                this.logThread.onmessage = undefined;
            });
            this.logThread.postMessage("flush")
        });
    }

    /**
     * Says it all....
     */
    public clearLogs(){
        this.logThread.postMessage("clear")
    }

    static getInstance(){
        return $Log.getInstance();
    }

}

export const $Log  = singleton(()=>new Log());
