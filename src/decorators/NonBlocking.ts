import { PlugFunction } from "../interface/socketFunction.ts";

export default class NonBlocking{
    /**
     * Little nifty code to push the passed function off the call stack and eventually (immediately) into the task queue.
     * The task queue will wait until the call stack is empty before pushing back into the call stack.
     * This can be used to deffer the function and execute other functions that are then pushed onto the stack.
     * @note not very efficient.. the v8 runtime treats function passing in setTimeout as "eval", this means TurboFan will NOT kick in...
     * @note not to be used for decorating PlugFunctions..
     * @param func 
     * @param args 
     */
    public static call(func: any, ...args: unknown[]){
        //setTimeout(function(...passed){passed[0](...passed.slice(1))},0, func, ...args) // keeping here for compatibility
        queueMicrotask(()=>func(...args)); // Deno has a built in rust-implemented version which is much safer.
    }

    /**
     * Decorator to be used for non blocking PlugFunction(s). see call() method for details on how this works.
     * @note this will still block other sockets from execution when it reaches the "slow" method..
     * @see NonBlocking.call()
     */
    public static $Call(func: PlugFunction): PlugFunction {
        return (socket, message, from) => NonBlocking.call(func, socket, message, from);
    }
}