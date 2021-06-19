import type { socketMessage } from "../interface/message.ts";

import Socket from "./Socket.ts";
import { Watcher } from "../FS/FileWatcher.ts";
import { PLUG_LENGTH, PlugFunction } from "../interface/socketFunction.ts";

export async function HandleEvent(
  socket: Readonly<Socket>, // TODO: make this singleton and provide it to whomever needs it via import
  message: socketMessage, 
  // from: WebSocket, // TODO: bring this back in but only the key (number) of the Map<number, WebSocket> should be passed.. the Socket class with provide helpers when needed
) {
  const fileWatcher: Watcher = socket.directoryWatcher;

  // TODO: try catch (fucking slow) vs then.catch ??? or we could get rid of both of them..
  // i believe promises provide more utility.. especially with the "finally()" allowing us to cleanup the proxied payload
  try {
    const m = await import(`../${fileWatcher.directory()}/${sanitizeEvent(message.event)}.ts?${fileWatcher.getHash()}`);

    (Object.values(m) as PlugFunction[]).filter(v=>typeof v === "function" && validateFunctionShape(v))
    .forEach((fn)=>{
        fn(socket, message); // TODO: return value here.. also send back returned value
    });
  } catch (error) {
    console.log(error);
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
function validateFunctionShape(x: PlugFunction){
  if(x.length != PLUG_LENGTH){
    console.error(`shape of ${x.name} is wrong. parameter count of ${x.length} needs to be ${PLUG_LENGTH}`);
    return false;
  }
  return true
}