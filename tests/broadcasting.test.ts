import { assertEquals } from "https://deno.land/std@0.106.0/testing/asserts.ts";
import { serve } from "https://deno.land/std@0.90.0/http/server.ts";
import { CONFIG } from "../src/config.js";
import { EventType, SocketMessage } from "../src/interface/message.ts";
import { socketS } from "../src/server/Socket.ts";

CONFIG.plugsFolder = "src/plugs";
CONFIG.secure = false;

const ws2 = new WebSocket("ws://localhost:8080");
const ws3 = new WebSocket("ws://localhost:8080");
const isOpen1 = new Promise<boolean>((res)=>ws2.addEventListener("open", () => res(true)));
const isOpen2 = new Promise<boolean>((res)=>ws3.addEventListener("open", () => res(true)));

const socket = socketS.getInstance();
let connected = 0;
for await (const req of serve(CONFIG.INSECURE)) {
  console.log("Received conn")
  socket.accept(req);
  connected++;
  if(connected >= 2) break;
}
console.log("break")

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

await Promise.all([isOpen1, isOpen2]);
console.log(isOpen1, isOpen2);

Deno.test("broadcasting yields", async () => {
    const res = waitForMessage(); // ws2
    const testObject2 = { event: "echo", payload: { count: 10 } };
    ws3.send(SocketMessage.encode(testObject2))
  
    assertEquals((await res).eventType, EventType.BROADCAST);
  
});

setTimeout(()=>{
    console.log("Force quitting deno as the framework runs indefinitely")
    Deno.exit(0)
}, 10000);