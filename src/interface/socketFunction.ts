import type { socketMessage } from "./message.ts";
import type { WebSocket } from "https://deno.land/std@0.90.0/ws/mod.ts";
import Socket from "../server/Socket.ts";
/**
 * Skeleton of the function that is called from EventHandler
 * @see HandleEvent
 */
export type PlugFunction = (
  socket: Readonly<Socket>,
  message: socketMessage
) => void;

/**
 * The length of the plug function, this allows shape checking to fail early.
 */
export const PLUG_LENGTH = 2;