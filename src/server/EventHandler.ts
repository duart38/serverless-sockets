import type { socketMessage } from "../interface/message.ts";
import type { WebSocket } from "https://deno.land/std@0.90.0/ws/mod.ts";

import Socket from "./Socket.ts";
import { Watcher } from "../FS/FileWatcher.ts";
import { PLUG_LENGTH } from "../interface/socketFunction.ts";

export async function HandleEvent(
  socket: Socket,
  message: socketMessage,
  from: WebSocket,
) {
  const fileWatcher: Watcher = socket.directoryWatcher;
  try {
    const m = await import(`../${fileWatcher.directory()}/${sanitizeEvent(message.event)}.ts?${fileWatcher.getHash()}`);
    Object.keys(m).forEach(async (FName)=>{
      try{
        if (typeof m[FName] === "function" && validateFunctionShape(m[FName])) await m[FName](socket, message, from) 
      }catch(e){
        console.log(e);
        from.send("error");
      }
    });
  } catch (error) {
    console.log(error);
    from.send("Invalid event");
  }
}

/**
 * @HOT
 * @param eventString 
 * @returns 
 */
function sanitizeEvent(eventString: string): string {
  return eventString.replaceAll(/(\W|\r|\t|\n|\s)+/g, "");
}

/**
 * Validates the shape of a plug function.
 * @HOT
 * @param x function.
 */
function validateFunctionShape(x: ()=>void){
  if(x.length != PLUG_LENGTH) throw new Error(`shape of ${x.name} is wrong. parameter count of ${x.length} needs to be ${PLUG_LENGTH}`);
}