import type { PlugFunction } from "../interface/socketFunction.ts";
import { socketS } from "../server/Socket.ts";
const socket = socketS.getInstance();
export const echo: PlugFunction = (message, _from) => {
  socket.broadcast(message);
};

// supports multiple functions in one plug
export const test: PlugFunction = (message, _from) => {
  console.log("some other function")
  for(let i = 0; i < 20; i++){
    message.payload["name"] = "John" + i;
  }

}