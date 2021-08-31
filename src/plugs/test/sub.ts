import type { ModuleGenerator } from "../../interface/socketFunction.ts";
export function* echo(): ModuleGenerator {
    console.log("I'm a sub");
    yield {
        event: "",
        payload: {}
    }
};