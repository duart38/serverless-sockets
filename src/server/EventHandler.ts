import type { socketMessage } from "../interface/message.ts";
import type { WebSocket } from "https://deno.land/std@0.90.0/ws/mod.ts";

import Socket from "./Socket.ts";
import { Watcher } from "../FS/FileWatcher.ts";
import { PLUG_LENGTH, PlugFunction } from "../interface/socketFunction.ts";
import NonBlocking from "../decorators/NonBlocking.ts";

export async function HandleEvent(
  socket: Socket,
  message: socketMessage,
  from: WebSocket,
) {
  const fileWatcher: Watcher = socket.directoryWatcher;
  try {
    const m = await import(`../${fileWatcher.directory()}/${sanitizeEvent(message.event)}.ts?${fileWatcher.getHash()}`);

    (Object.values(m) as PlugFunction[]).filter(v=>typeof v === "function" && validateFunctionShape(v))
    .forEach((fn)=>{
        NonBlocking.call(fn, socket, message, from);
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
function validateFunctionShape(x: PlugFunction){
  if(x.length != PLUG_LENGTH){
    console.error(`shape of ${x.name} is wrong. parameter count of ${x.length} needs to be ${PLUG_LENGTH}`);
    return false;
  }
  return true
}