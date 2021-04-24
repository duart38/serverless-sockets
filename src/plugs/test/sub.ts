import type { PlugFunction } from "../../interface/socketFunction.ts";
export const echo: PlugFunction = (socket, message) => {
    console.log("I'm a sub")
    socket.broadcast(message);
};