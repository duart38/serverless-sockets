import type { socketMessage } from "../interface/message.ts";

import { socketS } from "./Socket.ts";
import { Watcher } from "../FS/FileWatcher.ts";
import { PLUG_LENGTH, PlugFunction } from "../interface/socketFunction.ts";


/**
 * 
 * @param message says it all dun' it
 * @param from Represents the RID of the sender.
 */
export async function HandleEvent(
  message: socketMessage, 
  from: number,
) {
  const socket = socketS.getInstance();
  const fileWatcher: Watcher = socket.directoryWatcher;

  // TODO: try catch (slow) vs then.catch (probably does the same thing internally) ??? or we could get rid of both of them..
  // i believe promises provide more utility.. especially with the "finally()" allowing us to cleanup the proxied payload
  try {
    const m = await import(`../${fileWatcher.directory()}/${sanitizeEvent(message.event)}.ts?${fileWatcher.getHash()}`);

    (Object.values(m) as PlugFunction[]).filter(v=>typeof v === "function" && validateFunctionShape(v))
    .forEach((fn)=>{
        fn(message, from); // TODO: return value here.. also send back returned value
    });
  } catch (error) {
    console.log(error);
  }
  // i don't trust weakRefs for message because of possible long running methods, so this will do
  (message as unknown) = null;
}

/**
 * @HOT
 * @param eventString 
 * @returns 
 */
function sanitizeEvent(eventString: string): string {
  return eventString.replaceAll(/(\.{0,}|\r|\t|\n|\s|[!@#$%^&*()])+/g, "");
}

/**
 * Validates the shape of a plug function.
 * @HOT
 * @param x function.
 */
function validateFunctionShape(x: PlugFunction){
  if(x.length != PLUG_LENGTH){
    console.error(`shape of ${x.name} is wrong. parameter count of ${x.length} needs to be ${PLUG_LENGTH}`);
    return false;
  }
  return true
}