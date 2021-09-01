import type { socketMessage } from "../interface/message.ts";

import Socket, { socketS } from "./Socket.ts";
import { Watcher } from "../FS/FileWatcher.ts";
import { PLUG_LENGTH } from "../interface/socketFunction.ts";
import { CONFIG } from "../config.js";


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

    (Object.values(m) as AsyncGeneratorFunction[]).filter(v=>typeof v === "function" && validateFunctionShape(v))
    .forEach(async (fn)=>{
          // TODO: what if we return the gen functions and execute the send in socket itself?
        for await(const v of fn(message, from)) Socket.sendMessage(from, v as socketMessage);
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
function validateFunctionShape(x: AsyncGeneratorFunction){
  if(CONFIG.validateFunctionShape && x.length != PLUG_LENGTH){
    console.error(`shape of ${x.name} is wrong. parameter count of ${x.length} needs to be ${PLUG_LENGTH}`);
    return false;
  }
  return true
}