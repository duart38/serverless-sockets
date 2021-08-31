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

// supports multiple functions in one plug
export async function* test(message: socketMessage, _from: number): ModuleGenerator{
  console.log("some other test function")
  for(let i = 0; i < 1000; i++){
    //message.payload["name"] = "John" + i; // <-- only works in proxy-mode
    yield {
      event: "spam-mode",
      payload: {
        name: `iteration ${i}`
      }
    }
  }
}