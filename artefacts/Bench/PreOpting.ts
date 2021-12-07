import { SocketMessage } from "../../src/interface/message.ts";

const ws2 = new WebSocket("ws://localhost:8080");
let count = 0;
const maxCount = 10000;

ws2.addEventListener("message", async ({ data }) => {
  const returnMsg = SocketMessage.fromBuffer(await (data as Blob).arrayBuffer());
  console.log(returnMsg.event, returnMsg.payload, returnMsg.eventType);
  count++;
  if(count >= maxCount) console.timeEnd('startTimer')
});
ws2.addEventListener("open", () => {
  console.time('startTimer');
  ws2.send(SocketMessage.encode({ event: "multiyield", payload: { count: maxCount } }));
});


/*
NOTHING(no flags) first run        >>>               1767ms
NOTHING(no flags) second run       >>>               1881ms

--v8-flags=--always-opt first run       >>>	      2154ms
--v8-flags=--always-opt second run      >>>	      1936ms

 */

/*
deno run -A --v8-flags=--trace-opt,--trace-file-names,--trace-deopt mod.ts > v8dump.txt
*/