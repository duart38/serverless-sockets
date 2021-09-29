import type { yieldedSocketMessage } from "./message.ts";

export type ModuleGenerator =  AsyncGenerator<yieldedSocketMessage, yieldedSocketMessage | void, yieldedSocketMessage | void>

/**
 * The length of the plug function, this allows shape checking to fail early.
 */
export const PLUG_LENGTH = 2;