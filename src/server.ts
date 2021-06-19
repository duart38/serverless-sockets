import { serveTLS, serve } from "https://deno.land/std@0.90.0/http/server.ts";
import { CONFIG } from "./config.js";
import { preLoadPlugs } from "./server/PreLoader.ts";
import { socketS } from "./server/Socket.ts";

// TODO: take plug function from CLI
if (import.meta.main) {
  const socket = socketS.getInstance();
  CONFIG.preloadPlugs && preLoadPlugs(CONFIG.plugsFolder);
  // ... other http code goes here ...
  if(CONFIG.secure){
    console.log(`websocket server is running on :${CONFIG.TLS.port}`);
    for await (const req of serveTLS(CONFIG.TLS)) socket.accept(req);
  }else{
    console.log(`websocket server is running on :${CONFIG.INSECURE.port}`);
    for await (const req of serve(CONFIG.INSECURE)) socket.accept(req);
  }
}
