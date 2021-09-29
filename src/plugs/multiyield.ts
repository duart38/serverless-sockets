import { Log, LogLevel } from "../components/Log.ts";
import { SocketMessage } from "../interface/message.ts";
import { ModuleGenerator } from "../interface/socketFunction.ts";

// supports multiple functions in one plug
export async function* test(message: SocketMessage, _from: number): ModuleGenerator{
    Log.info({level: LogLevel.low, message: "some other test function"})
    for(let i = 0; i<message.payload.count; i++){
      //message.payload["name"] = "John" + i; // <-- only works in proxy-mode
      yield {
        event: "spam-mode",
        payload: {
          name: `iteration ${i}`
        }
      }
    }
}