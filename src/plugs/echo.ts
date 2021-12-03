import { EventType } from "../interface/message.ts";
import { SocketMessage } from "../interface/message.ts";
import { ModuleGenerator } from "../interface/socketFunction.ts";
export async function* broadcast(message: SocketMessage, _from: number): ModuleGenerator {
  yield {
    type: EventType.BROADCAST,
    event: "broadcast-1",
    payload: message.payload,
  };
}
