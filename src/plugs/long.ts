import { socketMessage } from "../interface/message.ts";
import { ModuleGenerator } from "../interface/socketFunction.ts";
export async function* long(message: socketMessage): ModuleGenerator {
    console.log("reached");
    await new Promise(resolve => setTimeout(resolve, message.payload.ms as number));
    yield {
        event: "waiting",
        payload: {}
    }
}