import { Events, SocketMessage, yieldedSocketMessage } from "../interface/message.ts";

import Socket, { socketS } from "./Socket.ts";
import { Watcher } from "../FS/FileWatcher.ts";
import { PLUG_LENGTH } from "../interface/socketFunction.ts";
import { CONFIG } from "../config.js";

/**
 * Handle incoming yields from modules.
 * @param msgRef the reference to the incoming message to be freed-up when yielding is done.
 */
function handleYields(generatorFunction: AsyncGenerator, from: number, msgRef: SocketMessage): void {
  generatorFunction.next().then((reply)=>{
    if(reply.done === true || reply.done === undefined) return msgRef.free();
    /* 
      send before we recursively call this method because otherwise the main event-loop will block the sending of messages
      which could potentially cause a memory overflow if the sum of yields are very large.
     */
    Socket.sendMessage(from,  reply.value as yieldedSocketMessage)?.then(()=>handleYields(generatorFunction, from, msgRef));
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
      for(let i = 0; i < gFn.length; i++) handleYields(gFn[i](incoming, from), from, incoming);
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