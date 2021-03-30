import type { socketMessage } from "./interface/message.ts";

const ws = new WebSocket("ws://localhost:8080");

ws.addEventListener("message", (ev) => console.log("back from server:", ev.data));
ws.addEventListener("open", () => {
  const testObject: socketMessage = { event: "echo", payload: "Hello World" };
  ws.send(JSON.stringify(testObject));
});
