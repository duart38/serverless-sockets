import type { ModuleGenerator } from "../interface/socketFunction.ts";
export function* notFound(): ModuleGenerator{
    // ... triggered when event was not found.
    yield {
        event: "404",
        payload: {}
    }
}