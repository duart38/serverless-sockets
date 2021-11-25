import singleton from "https://raw.githubusercontent.com/grevend/singleton/main/mod.ts";
import { Args, parse } from "https://deno.land/std@0.106.0/flags/mod.ts";
import { CONFIG } from "../config.js";
import { Log, LogLevel } from "./Log.ts";
import { moduleTemplate } from "../MISC/moduleTemplate.ts";

export class CLI {
    /**
     * Contains arguments parsed from the command line
     */
    private args: Args;
    private ready: Promise<void>;

    /**
     * Command Line Interface (CLI). used to parse command line arguments and set configuration values dynamically.
     * NOTE: use the singleton method to get the CLI instance.
     * NOTE: this instance needs to be run before the application starts as modifying the configuration is single threaded.
     * @see {$CLI}
     * @see {instance}
     */
    constructor(){
        this.args = parse(Deno.args);
        this.ready = new Promise((res, rej)=> {
            if(this.args["h"] !== undefined || this.args["help"] !== undefined){
                console.log(`\n\n
--generate <name of module> \t\t\t |generates an endpoint module with the name provided, the name is the name of the event|\n\n
Available configurations:`)
                if(Object.keys(this.args).length > 2){
                    delete this.args["h"];
                    delete this.args["help"];
                    
                    this.printHelp(this.args);
                }else{
                    this.printHelp(CONFIG);
                }
                rej();
            }else if(this.args["generate"] && typeof this.args["generate"] === "string"){
                Deno.writeTextFileSync(`${CONFIG.plugsFolder}/${this.args["generate"]}.ts`, moduleTemplate());
            }else{
                this.parseArgs();
                res();
            }
        });
    }

    /**
     * A promise that resolves when the CLI has parsed the flags and updated the configuration.
     * @returns {Promise<void>} resolved when all command line arguments have been parsed and configuration values have been set.
     */
    public onReady(): Promise<void>{
        return this.ready;
    }

    /**
     * Prints the help text for the CLI. this text includes all the available flags.
     * This method auto-generates the help text based on the configuration options by reading the file.
     * @param config The config file in the form of an object.
     * @param preKey DO NOT USE, this is to support recursive nesting in the object file.
     */
    public printHelp(config: Record<string, unknown>, preKey = ""){
        Object.entries(config).forEach(async ([key, v])=>{
            if(typeof v === "object"){
                this.printHelp(v as Record<string, unknown>, preKey + `${key}.`);
            }else{
                console.log("\n\t\t-------------------------")
                console.log(`\u001b[31m--${preKey}${key}\u001b[0m \u001b[34m${typeof v}\u001b`)
                await this.printDoc(`${preKey}${key}`);
            }
        });
    }
    private printDoc(path: string){
        if(!path.startsWith('configuration')) path = 'configuration.'+path;
        return Deno.run({
            cmd: ['deno', 'doc', 'config.js', `${path}`]
        }).status()
    }

    /**
     * Check if 2 types are equal
     * @param a lhs object
     * @param b rhs object
     * @returns true if the types are equal, false otherwise.
     */
    private _checkTypeEquals(a: unknown, b: unknown){
        return typeof a === typeof b;
    }
 
    /**
     * Parses the stored arguments (from the command line) and updates the configuration values.
     */
    private parseArgs(){
        Object.entries(this.args).filter(([k])=>k!=="_").forEach(([key, val])=>{
            if(CONFIG[key]){
                if(this._checkTypeEquals(CONFIG[key], val) === false){
                    Log.error({level: LogLevel.low, message: `Supplied argument ${key}'s type (${typeof val}) does not match config values type (${typeof CONFIG[key]}).`})   
                }
                if(typeof CONFIG[key] === "object"){
                    Object.entries(val).forEach(([eK, eV])=>{
                        if(this._checkTypeEquals(CONFIG[key][eK], eV) === false){
                            Log.error({level: LogLevel.low, message: `Supplied argument ${key}.${eK}'s type (${typeof eV}) does not match config values type (${typeof CONFIG[key][eK]}).`})   
                        }
                        CONFIG[key][eK] = eV;
                    })
                }else{
                    CONFIG[key] = val;
                }
            }else{
                Log.error({level: LogLevel.low, message: `Supplied argument ${key} is not a valid configuration option, run with -h to see available options`});
            }
        });
    }


    /**
     * Helper method to return a singleton instance of the CLI.
     * @returns a CLI instance.
     */
    static instance(){
        return $CLI.getInstance();
    }
}
export const $CLI  = singleton(()=>new CLI());
