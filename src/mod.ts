import { serve, serveTLS } from "https://deno.land/std@0.90.0/http/server.ts";
import { CLI } from "./components/CLI.ts";
import { Log } from "./components/Log.ts";
import { CONFIG } from "./config.js";
import { preLoadPlugs } from "./server/PreLoader.ts";
import { socketS } from "./server/Socket.ts";

export function start() {
  const cli = CLI.instance();
  cli.onReady().then(async () => {
    console.log("\n\n\tPID: " + Deno.pid);
    if (CONFIG.memoryMetrics.isOn) {
      setInterval(() => {
        const mem = Deno.memoryUsage();
        Log.info(`
        ----------- Process id: ${Deno.pid} -----------
        |\tTotal heap size: ${(mem.heapTotal / 100000).toFixed(2)} MB\t|
        |\tTotal heap used: ${(mem.heapUsed / 100000).toFixed(2)} MB\t|
        |\tExternal       : ${(mem.external / 100000).toFixed(2)}  MB\t|
        -----------------------------------------
        `);
      }, CONFIG.memoryMetrics.interval);
    }
    const socket = socketS.getInstance();
    const init = await import("./INIT.ts");
    init?.INIT(socket);

    CONFIG.preloadPlugs && preLoadPlugs(CONFIG.plugsFolder);
    // ... other http code goes here ...
    if (CONFIG.secure) {
      Log.info(`websocket server is running on :${CONFIG.TLS.port}`);
      for await (const req of serveTLS(CONFIG.TLS)) socket.accept(req);
    } else {
      Log.info(`websocket server is running on :${CONFIG.INSECURE.port}`);
      for await (const req of serve(CONFIG.INSECURE)) socket.accept(req);
    }
  }).catch((_: unknown) => {});
}

if (import.meta.main) {
  start();
}

export * from "./interface/message.ts";
export * from "./interface/socketFunction.ts";
export * from "./interface/sync.ts";
export * from "./server/Socket.ts";