import singleton from "https://raw.githubusercontent.com/grevend/singleton/main/mod.ts";
class Log {
    public info(msg: string){}
    public error(msg: string){}
    public silent<I>(x: ()=>I): I | null {
        try{return x()}catch(e){this.error(e)}
        return null;
    }

}

export const $Log  = singleton(()=>new Log());
