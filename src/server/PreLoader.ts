export async function preLoadPlugs(folder: string){
    for await(const entry of Deno.readDir(folder)){
        if(entry.isFile) await import(`../${folder}/${entry.name}`);
        else console.log(`../${folder}/${entry.name}`); // TODO: nesting support
    }
}