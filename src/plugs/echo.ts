import type { PlugFunction } from "../interface/socketFunction.ts";
export const echo: PlugFunction = (socket, message) => {
  socket.broadcast(message);
};

// supports multiple functions in one plug
export const test: PlugFunction = (_socket, message) => {
  console.log("some other function")
  for(let i = 0; i < 20; i++){
    message.payload["name"] = "John" + i;
  }

}