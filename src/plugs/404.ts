import type { PlugFunction } from "../interface/socketFunction.ts";
export const notFound: PlugFunction = (socket, message) => {
    // ... triggered when event was not found.
    console.log(message);
}