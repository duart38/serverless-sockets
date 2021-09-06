import { Log, LogLevel } from "../components/Log.ts";

export async function preLoadPlugs(folder: string){
    Log.info({level: LogLevel.low, message: `[+] pre-loading folder: ${folder}`})
    for await(const entry of Deno.readDir(folder)){
        if(entry.isFile) await import(`../${folder}/${entry.name}`);
        else preLoadPlugs(`${folder}/${entry.name}`)// console.log(`../${folder}/${entry.name}`); // TODO: nesting support
    }
}