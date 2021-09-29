import { SocketMessage } from "../interface/message.ts";
import { ModuleGenerator } from "../interface/socketFunction.ts";
import Socket from "../server/Socket.ts";
export async function* broadcast(message: SocketMessage, from: number): ModuleGenerator{
  Socket.broadcast(message, from);
  yield {
    event: "",
    payload: {}
  }
}

