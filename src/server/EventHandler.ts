/*
 *   Copyright (c) 2022 Duart Snel

 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.

 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.

 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { EventType, SocketMessage, yieldedSocketMessage } from "../interface/message.ts";
import Socket, { socketS } from "./Socket.ts";
import { Watcher } from "../FS/FileWatcher.ts";
import { ModuleGenerator, PLUG_LENGTH } from "../interface/socketFunction.ts";
import { CONFIG } from "../config.js";
import { calculateUpdatePaths } from "../MISC/utils.ts";

/**
 * Handle incoming yields from modules.
 * @param msgRef the reference to the incoming message to be freed-up when yielding is done.
 */
function handleYields(generatorFunction: ModuleGenerator, from: WebSocket, msgRef: SocketMessage, prev: yieldedSocketMessage | undefined = undefined): void {
  generatorFunction.next().then((reply) => {
    if (reply.done === true || reply.done === undefined) return msgRef.free();
    /*
      send before we recursively call this method because otherwise the main event-loop will block the sending of messages
      which could potentially cause a memory overflow if the sum of yields are very large.
     */

    if(!reply.value.event) reply.value.event = msgRef.event;
    switch(reply.value.type){
      case EventType.MESSAGE: {
        Socket.sendMessage(from, reply.value)
        handleYields(generatorFunction, from, msgRef);
        break;
      }
      case EventType.BROADCAST: {
        Socket.broadcast(reply.value, CONFIG.excludeSenderOnBroadcast ? from : undefined);
        handleYields(generatorFunction, from, msgRef);
        break;
      }
      case EventType.SYNC: {
        const toSend = {
          ...reply.value,
          payload: calculateUpdatePaths(prev !== undefined ? SocketMessage.encode(prev) : msgRef.raw, SocketMessage.encode(reply.value))
        }
        Socket.sendMessage(from, toSend);
        handleYields(generatorFunction, from, msgRef, reply.value);
        break;
      }
      default: {
        Socket.sendMessage(from, reply.value);
        handleYields(generatorFunction, from, msgRef);
      }
    }
  });
}

/**
 * @param message says it all dun' it
 * @param from Represents the RID of the sender.
 */
export async function HandleEvent(
  incoming: SocketMessage,
  from: WebSocket,
) {
  const socket = socketS.getInstance();
  const fileWatcher: Watcher = socket.directoryWatcher;

  const sanitized = sanitizeEvent(incoming.event);
  if (fileWatcher.containsFile(sanitized)) {
    const m = await import(`file://${Deno.cwd()}/${fileWatcher.directory()}/${sanitized}.ts?${fileWatcher.getFileHash(sanitized)}`);

    const gFn = (Object.values(m) as AsyncGeneratorFunction[]).filter((v) => typeof v === "function" && validateFunctionShape(v));
    for (let i = 0; i < gFn.length; i++) handleYields(gFn[i](incoming, from) as ModuleGenerator, from, incoming);
    // i don't trust weakRefs for message because of possible long running methods, so this will do
    (incoming as unknown) = null;
  } else {
    Socket.sendMessage(from, { type: EventType.NOT_FOUND, event: incoming.event, payload: {} });
  }
}

/**
 * @HOT
 * @param eventString
 * @returns
 */
export function sanitizeEvent(eventString: string): string {
  return eventString.replaceAll(/(\.{0,}|\r|\t|\n|\s|[!@#$%^&*()])+/g, "");
}

/**
 * Validates the shape of a plug function.
 * @HOT
 * @param x function.
 */
export function validateFunctionShape(x: AsyncGeneratorFunction) {
  if (CONFIG.validateFunctionShape && x.length != PLUG_LENGTH) {
    console.error(`shape of ${x.name} is wrong. parameter count of ${x.length} needs to be ${PLUG_LENGTH}`);
    return false;
  }
  return true;
}
