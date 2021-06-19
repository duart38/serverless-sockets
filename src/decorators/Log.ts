import singleton from "https://raw.githubusercontent.com/grevend/singleton/main/mod.ts";
class Log {
    // TODO: launch a thread and post to it to handle everything..
    public info(msg: string){}
    public error(msg: string){}
    public silent<I>(x: ()=>I): I | null {
        try{return x()}catch(e){this.error(e)}
        return null;
    }

    // TODO: also add payload size logging here.. in threads ofc

}

export const $Log  = singleton(()=>new Log());
