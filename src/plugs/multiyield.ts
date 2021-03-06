import { Log } from "../components/Log.ts";
import { SocketMessage } from "../interface/message.ts";
import { ModuleGenerator } from "../interface/socketFunction.ts";

export async function* test(message: SocketMessage, _from: number): ModuleGenerator {
  Log.info("some other test function");
  for (let i = 0; i < message.payload.count; i++) {
    yield {
      payload: {
        name: `iteration ${i}`,
      },
    };
  }
}
