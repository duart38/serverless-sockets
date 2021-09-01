import singleton from "https://raw.githubusercontent.com/grevend/singleton/main/mod.ts";

export enum LogLevel {
    hidden, low, medium, high, extreme
}
interface LogShape {
    level: LogLevel,
    message: string
}
export class Log {
    private logThread: Worker;
    constructor(){
        this.logThread = new Worker(new URL("../MISC/Threads/LoggingThread.js", import.meta.url).href, { type: "module" });
    }
    public static info(t: LogShape){ $Log.getInstance().logThread.postMessage(t) }
    public static error(t: LogShape){ $Log.getInstance().logThread.postMessage(t) }
    public static silent<I>(x: ()=>I): I | null {
        try{return x()}catch(e){Log.error({level: LogLevel.hidden, message: e})}
        return null;
    }
    public getAllLogs(){
        return new Promise<LogShape[]>((res,rej)=>{
            this.logThread.postMessage("flush")
            this.logThread.onmessage = ((e: MessageEvent<LogShape[]>) => res(e.data));
            this.logThread.onmessage = undefined;
        });
    }

    public clearLogs(){
        this.logThread.postMessage("clear")
    }

    static getInstance(){
        return $Log.getInstance();
    }

    // TODO: also add payload size logging here.. in threads ofc

}

export const $Log  = singleton(()=>new Log());
