import type { PlugFunction } from "../../interface/socketFunction.ts";
import { socketS } from "../../server/Socket.ts";
const socket = socketS.getInstance();
export const echo: PlugFunction = (message, _from) => {
    console.log("I'm a sub")
    socket.broadcast(message);
};