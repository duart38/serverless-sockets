import type { socketMessage } from "./interface/message.ts";


function firstConnection(){
  let ws = new WebSocket("ws://localhost:8080");
  ws.addEventListener("message", (ev) => console.log(ev.data));
  ws.addEventListener("open", () => {
    const testObject: socketMessage = { event: "decorate", payload: "xx" };
    ws.send(JSON.stringify(testObject));
  });
}

function secondConnection(){
  let second = new WebSocket("ws://localhost:8080");
  second.addEventListener("message", (ev) => console.log(ev.data));
  second.addEventListener("open", () => { second.send(JSON.stringify({ event: "echo", payload: "Hello World" })) });
}

// firstConnection();
secondConnection();

/**
 * Brute force test below
 */
// const CONNECTIONS = 2;
// const testObject: socketMessage = { event: "decorate", payload: `Connection` };
// const msg = JSON.stringify(testObject);
// for(let i = 0; i < CONNECTIONS; i++){
//   const ws = new WebSocket("ws://localhost:8080");
//   ws.addEventListener("open", () => {
//     ws.addEventListener("message",()=>console.log(`got message back from instance ${i}`))
//     ws.send(msg);
//   });
// }