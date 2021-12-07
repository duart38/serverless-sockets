import { socketMessage } from "../interface/message.ts";
import { ModuleGenerator } from "../interface/socketFunction.ts";
export async function* long(message: socketMessage): ModuleGenerator {
  console.log("reached");
  await new Promise((resolve) => setTimeout(resolve, (message.payload as Record<string, unknown>).ms as number));
  yield {
    payload: {},
  };
}
