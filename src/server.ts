import { serveTLS, serve } from "https://deno.land/std@0.90.0/http/server.ts";
import { CLI } from "./components/CLI.ts";
import { Log, LogLevel } from "./components/Log.ts";
import { CONFIG } from "./config.js";
import { preLoadPlugs } from "./server/PreLoader.ts";
import { socketS } from "./server/Socket.ts";

export function start(){
  const cli = CLI.instance();
  cli.onReady().then(async ()=>{
      const socket = socketS.getInstance();
      CONFIG.preloadPlugs && preLoadPlugs(CONFIG.plugsFolder);
      // ... other http code goes here ...
      if(CONFIG.secure){
        Log.info({level: LogLevel.low, message:`websocket server is running on :${CONFIG.TLS.port}`});
        for await (const req of serveTLS(CONFIG.TLS)) socket.accept(req);
      }else{
        Log.info({level: LogLevel.low, message:`websocket server is running on :${CONFIG.INSECURE.port}`});
        for await (const req of serve(CONFIG.INSECURE)) socket.accept(req);
      }
  }).catch((e)=>{Log.error({level: LogLevel.medium, message: e})});
}

if(import.meta.main){
  start();
}