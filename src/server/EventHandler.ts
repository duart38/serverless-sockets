import { EventType, SocketMessage, yieldedSocketMessage } from "../interface/message.ts";

import Socket, { socketS } from "./Socket.ts";
import { Watcher } from "../FS/FileWatcher.ts";
import { ModuleGenerator, PLUG_LENGTH } from "../interface/socketFunction.ts";
import { CONFIG } from "../config.js";
import { FreeAble } from "../interface/mem.ts";

/**
 * Handle incoming yields from modules.
 * @param msgRef the reference to the incoming message to be freed-up when yielding is done.
 */
function handleYields(generatorFunction: ModuleGenerator, from: number, msgRef: FreeAble): void {
  generatorFunction.next().then((reply)=>{
    if(reply.done === true || reply.done === undefined) return msgRef.free();
    /* 
      send before we recursively call this method because otherwise the main event-loop will block the sending of messages
      which could potentially cause a memory overflow if the sum of yields are very large.
     */

    if(reply.value.type === EventType.BROADCAST){
      Socket.broadcast(reply.value, CONFIG.excludeSenderOnBroadcast ? from : undefined);
      handleYields(generatorFunction, from, msgRef);
    }else{
      Socket.sendMessage(from,  reply.value)
      ?.then(()=>handleYields(generatorFunction, from, msgRef));
    }
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
      for(let i = 0; i < gFn.length; i++) handleYields(gFn[i](incoming, from) as ModuleGenerator, from, incoming);
      // i don't trust weakRefs for message because of possible long running methods, so this will do
      (incoming as unknown) = null;
    }else{
      Socket.sendMessage(from, {type: EventType.NOT_FOUND, event: incoming.event, payload: {}});
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