/**
 * FreeAble classes are classes that contain code that can be run to do an early cleanup.
 * I.E. will accelerate the GC process of the V8 Engine
 */
export interface FreeAble {
    free(): void;
}