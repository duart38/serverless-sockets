import { Events, SocketMessage, yieldedSocketMessage } from "../interface/message.ts";

import Socket, { socketS } from "./Socket.ts";
import { Watcher } from "../FS/FileWatcher.ts";
import { PLUG_LENGTH } from "../interface/socketFunction.ts";
import { CONFIG } from "../config.js";


function handleYields(generatorFunction: AsyncGenerator, from: number){
  generatorFunction.next().then((reply)=>{
    if(reply.done === true || reply.done === undefined) return
    Socket.sendMessage(from,  reply.value as yieldedSocketMessage);
    handleYields(generatorFunction, from);
  })
}

/**
 * 
 * @param message says it all dun' it
 * @param from Represents the RID of the sender.
 */
export async function HandleEvent(
  incoming: SocketMessage, 
  from: number,
) {
  const socket = socketS.getInstance();
  const fileWatcher: Watcher = socket.directoryWatcher;

  const sanitized = sanitizeEvent(incoming.event);
    if(fileWatcher.containsFile(sanitized)){
      const m = await import(`${fileWatcher.directory()}/${sanitized}.ts?${fileWatcher.getFileHash(sanitized)}`);

      const gFn = (Object.values(m) as AsyncGeneratorFunction[]).filter(v=>typeof v === "function" && validateFunctionShape(v));
      for(let i = 0; i < gFn.length; i++) {
        handleYields(gFn[i](incoming, from), from);
      }
      // i don't trust weakRefs for message because of possible long running methods, so this will do
      (incoming as unknown) = null;
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