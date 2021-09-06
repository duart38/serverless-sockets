import { Log, LogLevel } from "../components/Log.ts";

export async function preLoadPlugs(folder: string){
    Log.info({level: LogLevel.low, message: `[+] pre-loading folder: ${folder}`})
    for await(const entry of Deno.readDir(folder)){
        if(entry.isFile) {
            try{
                await import(`${folder}/${entry.name}`);
            }catch(_e){Log.error({level: LogLevel.extreme, message: `Could not pre-load file ../${folder}/${entry.name}`})}
        }
        else preLoadPlugs(`${folder}/${entry.name}`)// console.log(`../${folder}/${entry.name}`); // TODO: nesting support
    }
}