import type { PlugFunction } from "../interface/socketFunction.ts";
export const notFound: PlugFunction = (_socket, message) => {
    // ... triggered when event was not found.
    console.log(message);
}