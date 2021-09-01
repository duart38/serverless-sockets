import { ModuleGenerator } from "../interface/socketFunction.ts";
export async function* long(): ModuleGenerator {
    console.log("reached");
    await new Promise(resolve => setTimeout(resolve, 5000));
    yield {
        event: "waiting",
        payload: {}
    }
}