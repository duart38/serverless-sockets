import { assert, assertEquals, fail } from "https://deno.land/std@0.106.0/testing/asserts.ts";
import { serve } from "https://deno.land/std@0.90.0/http/server.ts";
import { CONFIG } from "../src/config.js";
import { socketMessage } from "../src/interface/message.ts";
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
  return new Promise<socketMessage>((res)=>{
    console.log("Waiting for message")
    const fn = (ev: MessageEvent) => {
      console.log("message received")
      res(JSON.parse(ev.data));
      ws2.removeEventListener("message", fn);
    }
    ws2.addEventListener("message", fn);
  })
}

const isOpen = await new Promise<boolean>((res)=>ws2.addEventListener("open", () => res(true)));
console.log(isOpen);
Deno.test("Payload and single yield works", async () => {
  const res = waitForMessage();
  ws2.send(JSON.stringify({ event: "multiyield", payload: {count: 1} }));
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
  ws2.send(JSON.stringify({ event: "multiyield", payload: {count: 4} }));
});