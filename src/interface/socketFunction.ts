import type { serializable, yieldedSocketMessage } from "./message.ts";

/**
 * The async generator method used for socket functions (modules).
 */
export type ModuleGenerator<T extends serializable = Record<string, unknown>> = AsyncGenerator<yieldedSocketMessage<T>, yieldedSocketMessage<T> | void, yieldedSocketMessage<T> | void>;

/**
 * The length of the plug function, this allows shape checking to fail early.
 */
export const PLUG_LENGTH = 2;
