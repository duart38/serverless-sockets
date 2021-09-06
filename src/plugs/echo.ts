import { socketMessage } from "../interface/message.ts";
import { ModuleGenerator } from "../interface/socketFunction.ts";
import Socket from "../server/Socket.ts";
export async function* broadcast(message: socketMessage, _from: number): ModuleGenerator{
  Socket.broadcast(message);
  yield {
    event: "",
    payload: {}
  }
}

