import type { socketMessage } from "./message.ts";

export type ModuleGenerator =  Generator<socketMessage, socketMessage | void, socketMessage | void>

/**
 * The length of the plug function, this allows shape checking to fail early.
 */
export const PLUG_LENGTH = 2;