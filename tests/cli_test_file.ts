import { CLI } from "../src/components/CLI.ts";
import { CONFIG } from "../src/config.js";

const cli = CLI.instance();
cli.onReady().then(()=>{
    console.log(`$_$_$
${JSON.stringify(CONFIG)}
$_$_$`)
    Deno.exit(0)
}).catch(_=>{
    Deno.exit(1)
});