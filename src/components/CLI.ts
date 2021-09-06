import singleton from "https://raw.githubusercontent.com/grevend/singleton/main/mod.ts";
import { parse } from "https://deno.land/std@0.106.0/flags/mod.ts";
import { CONFIG } from "../config.js";
import { Log, LogLevel } from "./Log.ts";

export class CLI {
    private args;
    private ready: Promise<void>;

    constructor(){
        this.args = parse(Deno.args);
        this.ready = new Promise((res, rej)=> {
            if(this.args["h"] !== undefined || this.args["help"] !== undefined){
                this.printHelp(CONFIG);
                rej();
            }else{
                this.parseArgs();
                res();
            }
        });
    }

    public onReady(): Promise<void>{
        return this.ready;
    }

    public printHelp(config: Record<string, unknown>, preKey = ""){
        Object.entries(config).forEach(([key, v])=>{
            if(typeof v === "object"){
                this.printHelp(v as Record<string, unknown>, preKey + `${key}.`);
            }else{
                console.log(`--${preKey}${key} ${typeof v}`)
            }
        });
    }
    private _checkTypeEquals(a: unknown, b: unknown){
        return typeof a === typeof b;
    }
 
    private parseArgs(){
        Object.entries(this.args).filter(([k])=>k!=="_").forEach(([key, val])=>{
            if(CONFIG[key]){
                if(this._checkTypeEquals(CONFIG[key], val) === false){
                    Log.error({level: LogLevel.low, message: `Supplied argument ${key}'s type (${typeof val}) does not match config values type (${typeof CONFIG[key]}).`})   
                }
                console.log(key, CONFIG[key], val)
                if(typeof CONFIG[key] === "object"){
                    Object.entries(val).forEach(([eK, eV])=>{
                        if(this._checkTypeEquals(CONFIG[key][eK], eV) === false){
                            Log.error({level: LogLevel.low, message: `Supplied argument ${key}.${eK}'s type (${typeof eV}) does not match config values type (${typeof CONFIG[key][eK]}).`})   
                        }
                        CONFIG[key][eK] = eV; // TODO: only supports one level deep, make recursive
                    })
                }else{
                    CONFIG[key] = val;
                }
            }else{
                Log.error({level: LogLevel.low, message: `Supplied argument ${key} is not a valid configuration option, run with -h to see available options`});
            }
        });
    }


    static instance(){
        return $CLI.getInstance();
    }
}
export const $CLI  = singleton(()=>new CLI());
