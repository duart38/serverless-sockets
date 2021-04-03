import type { PlugFunction } from "../interface/socketFunction.ts";
export const notFound: PlugFunction = (socket, message, from) => {
    // ... triggered when event was not found.
}