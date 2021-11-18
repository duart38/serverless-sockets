import { CLI } from "../src/components/CLI.ts";

const cli = CLI.instance();
cli.onReady().then(()=>{
    Deno.exit(1);
}).catch(_=>{ // CLI rejects the promise when help is printed
    Deno.exit(0)
});