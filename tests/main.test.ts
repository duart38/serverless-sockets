import { assert, assertEquals, fail } from "https://deno.land/std@0.106.0/testing/asserts.ts";
import { serve } from "https://deno.land/std@0.90.0/http/server.ts";
import { CONFIG } from "../src/config.js";
import { SocketMessage } from "../src/interface/message.ts";
import { socketS } from "../src/server/Socket.ts";

CONFIG.plugsFolder = Deno.cwd() + "/src/plugs";

const ws2 = new WebSocket("ws://localhost:8080");
const socket = socketS.getInstance();
for await (const req of serve(CONFIG.INSECURE)) {
  console.log("Received conn")
  socket.accept(req);
  break;
}

function waitForMessage(){
  return new Promise<SocketMessage>((res)=>{
    console.log("\n\n\t###Waiting for message\n\n")
    const fn = async ({data}: MessageEvent) => {
      console.log("message received")
      res(SocketMessage.fromBuffer(await (data as Blob).arrayBuffer()));
      ws2.removeEventListener("message", fn);
    }
    ws2.addEventListener("message", fn);
  })
}

const isOpen = await new Promise<boolean>((res)=>ws2.addEventListener("open", () => res(true)));
console.log(isOpen);
Deno.test("Payload and single yield works", async () => {
  const res = waitForMessage();
  const payload = { event: "multiyield", payload: {count: 1} };
  ws2.send(SocketMessage.encode(payload));
  assertEquals((await res).event, "spam-mode")
});

Deno.test("multi yields", () => {
  const timeout = setTimeout(()=>fail("Timeout"), 8000);
  let count = 0;
  const fn = () => {
    count++;
    if(count > 3){
      assert("SOLID");
      clearTimeout(timeout);
      ws2.removeEventListener("message",fn);
    }
  }
  ws2.addEventListener("message", fn);
  const payload = { event: "multiyield", payload: {count: 4} }
  ws2.send(SocketMessage.encode(payload));
});

setTimeout(()=>{
  console.log("Force quitting deno as the framework runs indefinitely")
  Deno.exit(0)
}, 1000000);