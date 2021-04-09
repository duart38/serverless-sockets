import type { PlugFunction } from "../interface/socketFunction.ts";
export const echo: PlugFunction = (socket, message) => {
  socket.broadcast(message);
};

// supports multiple functions in one plug
export const test: PlugFunction = (socket, message) => {
  console.log("some other function")
  message.payload["name"] = "John";
}