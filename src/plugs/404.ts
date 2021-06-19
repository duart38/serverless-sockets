import type { PlugFunction } from "../interface/socketFunction.ts";
export const notFound: PlugFunction = (message, _from) => {
    // ... triggered when event was not found.
    console.log(message);
}