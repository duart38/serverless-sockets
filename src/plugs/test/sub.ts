import type { ModuleGenerator } from "../../interface/socketFunction.ts";
export async function* echo(): ModuleGenerator {
    console.log("I'm a sub");
    yield {
        event: "",
        payload: {}
    }
}