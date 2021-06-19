import type { socketMessage } from "./message.ts";
/**
 * Skeleton of the function that is called from EventHandler
 * @see HandleEvent
 */
export type PlugFunction = (
  message: socketMessage,
  from: number
) => void;

/**
 * The length of the plug function, this allows shape checking to fail early.
 */
export const PLUG_LENGTH = 2;