import { assertEquals, assertNotEquals } from "https://deno.land/std@0.106.0/testing/asserts.ts";
import { serve } from "https://deno.land/std@0.90.0/http/server.ts";
import { CONFIG } from "../src/config.js";
import { SocketMessage, yieldedSocketMessage } from "../src/interface/message.ts";
import { socketS } from "../src/server/Socket.ts";

const tempDir = Deno.makeTempDirSync();
function writeToTemp(file:string, toYield: yieldedSocketMessage){
    Deno.writeTextFileSync(`${tempDir}/${file}.ts`, `
export async function* testFunc(){
    yield ${JSON.stringify(toYield)}
}`)
}

writeToTemp('test', {event: 'unchanged', payload: {}});

CONFIG.plugsFolder = tempDir;

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
      res(SocketMessage.fromBuffer(await (data as Blob).arrayBuffer()));
      ws2.removeEventListener("message", fn);
    }
    ws2.addEventListener("message", fn);
  })
}

const _isOpen = await new Promise<boolean>((res)=>ws2.addEventListener("open", () => res(true)));

Deno.test("Server re-loads changed files", async () => {
  const res = waitForMessage();
  const payload = { event: "test", payload: {} };
  ws2.send(SocketMessage.encode(payload));
  writeToTemp('test', {event: 'changed', payload: {}});
  assertNotEquals((await res).event, "unchanged")
  assertEquals((await res).event, "changed")
});


setTimeout(()=>{
    console.log("Force quitting deno as the framework runs indefinitely")
    Deno.exit(0)
}, 1000000);