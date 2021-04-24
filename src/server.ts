import { serve } from "https://deno.land/std@0.90.0/http/server.ts";
import Socket from "./server/Socket.ts";

// TODO: TLS? (depends on deployment style)
// TODO: take plug function from CLI
if (import.meta.main) {
  const port = Deno.args[0] || "8080"; // TODO: parse "port" flag for various server providers to supply
  console.log(`websocket server is running on :${port}`);
  const socket = new Socket("./plugs");
  // ... other http code goes here ...
  for await (const req of serve(`:${port}`)) socket.accept(req);
}
