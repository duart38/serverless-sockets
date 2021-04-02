import type { PlugFunction } from "../interface/socketFunction.ts";
export const echo: PlugFunction = (socket, message, from) => {
  socket.broadcast(message);
};

// supports multiple functions in one plug
export const test: PlugFunction = (socket, message, from) => {
  console.log("some other function")
}