import singleton from "https://raw.githubusercontent.com/grevend/singleton/main/mod.ts";
class Log {
    static info(msg: string){}
    static error(msg: string){}
}

export const $Log  = singleton(()=>new Log());
