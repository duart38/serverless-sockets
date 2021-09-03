import { Events, socketMessage } from "../interface/message.ts";

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

  const sanitized = sanitizeEvent(message.event);
    if(fileWatcher.containsFile(sanitized)){
      const m = await import(`../${fileWatcher.directory()}/${sanitized}.ts?${fileWatcher.getFileHash(sanitized)}`);

      (Object.values(m) as AsyncGeneratorFunction[]).filter(v=>typeof v === "function" && validateFunctionShape(v))
      .forEach(async (fn)=>{
            // TODO: what if we return the gen functions and execute the send in socket itself?
          for await(const v of fn(message, from)) Socket.sendMessage(from, v as socketMessage);
      });
    // i don't trust weakRefs for message because of possible long running methods, so this will do
    (message as unknown) = null;
    }else{
      Socket.sendMessage(from, {event: Events.ERROR, payload: {}});
    }
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