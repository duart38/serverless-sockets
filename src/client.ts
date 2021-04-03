import type { socketMessage } from "./interface/message.ts";

function firstConnection(){
  const ws = new WebSocket("ws://localhost:8080");
  ws.addEventListener("message", (ev) => console.log(ev.data));
  ws.addEventListener("open", () => {
    const testObject: socketMessage = { event: "decorate", payload: "xx" };
    ws.send(JSON.stringify(testObject));
  });
}

firstConnection();