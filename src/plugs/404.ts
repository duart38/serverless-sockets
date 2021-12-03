import type { ModuleGenerator } from "../interface/socketFunction.ts";
export async function* notFound(): ModuleGenerator {
  // ... triggered when event was not found.
  yield {
    event: "404",
    payload: {},
  };
}
