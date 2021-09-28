import { ModuleGenerator } from "../interface/socketFunction.ts";

/**
 * Example of a blocking module..
 */
export async function* long(): ModuleGenerator {
    console.log("reached");
    await new Promise(resolve => setTimeout(resolve, 8000));
    yield {
        event: "waiting",
        payload: {
            done: true
        }
    }
}