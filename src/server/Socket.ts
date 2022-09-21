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

import type { ServerRequest } from "https://deno.land/std@0.90.0/http/server.ts";
import { EventType, serializable, SocketMessage, yieldedSocketMessage } from "../interface/message.ts";

import { acceptWebSocket, isWebSocketCloseEvent, WebSocket } from "https://deno.land/std@0.90.0/ws/mod.ts";
import { Watcher } from "../FS/FileWatcher.ts";
import { HandleEvent } from "./EventHandler.ts";
import { Log } from "../components/Log.ts";
import { CONFIG } from "../config.js";

import singleton from "https://raw.githubusercontent.com/grevend/singleton/main/mod.ts";

export default class Socket {
  public connections: Map<number, WebSocket>;
  public directoryWatcher: Watcher;
  protected instanceID: string;
  constructor(plugsDir: string) {
    Log.info(`[+] Opening socket with function folder: ${plugsDir}`);
    this.directoryWatcher = new Watcher(plugsDir);
    this.instanceID = crypto.getRandomValues(new Uint32Array(2)).join("");
    this.connections = new Map();
  }

  private handleClose(socket: WebSocket) {
    if (!socket.isClosed) socket.close();
    this.connections.delete(socket.conn.rid);
    dispatchEvent(new Event(this.instanceID + "_disconnect"));
  }

  private async waitForSocket(socket: WebSocket) {
    if (socket.isClosed) return;
    try {
      for await (const ev of socket) {
        if (ev instanceof Uint8Array) {
          const incoming = SocketMessage.fromRaw(ev);
          if (incoming.sizeOfMessage <= CONFIG.payloadLimit) {
            HandleEvent(incoming, socket.conn.rid);
          } else {
            Log.info(`payload with size ${incoming.sizeOfMessage} was rejected entrance. RID: ${socket.conn.rid}`);
          }
        } else if (isWebSocketCloseEvent(ev)) {
          this.handleClose(socket);
        }
      }
    } catch (err) {
      console.error(`failed to receive frame: ${err}`);

      if (!socket.isClosed) {
        await socket.close(1000).catch(console.error);
        this.handleClose(socket);
      }
    }
  }

  /**
   * Accepts a request and upgrades it to a WebSocket connection.
   */
  public accept(req: ServerRequest) {
    const { conn, r: bufReader, w: bufWriter, headers } = req;
    acceptWebSocket({ conn, bufReader, bufWriter, headers })
      .then((socket) => {
        this.connections.set(socket.conn.rid, socket);
        dispatchEvent(new Event(this.instanceID + "_connect"));
        this.waitForSocket(socket);
      })
      .catch(async (err: unknown) => {
        console.error(`failed to accept websocket: ${err}`);
        await req.respond({ status: 400 });
      });
  }

  /**
   * Calls the callBack when a socket connects.
   */
  public onSocketConnect(callBack: () => void) {
    addEventListener(this.instanceID + "_connect", callBack);
  }

  /**
   * Calls the callBack when a socket connects.
   */
  public onSocketDisconnect(callBack: () => void) {
    addEventListener(this.instanceID + "_disconnect", callBack);
  }

  /**
   * Broadcasts a message to all connected clients.
   * @param data the data to send
   * @param exclude the socket id to exclude (tip: exclude yourself)
   */
  static broadcast(data: yieldedSocketMessage, exclude?: number) {
    const socket = socketS.getInstance();
    socket.connections.forEach((s) => {
      if (!s.isClosed && s.conn.rid !== exclude) {
        s.send(SocketMessage.encode(Object.assign(data, { type: EventType.BROADCAST, payload: { ...data.payload } })))
          .catch(() => socket.handleClose(s));
      }
    });
  }
  /**
   * Ban hammer.
   */
  public kickAll() {
    this.connections.forEach((x) => this.handleClose(x));
  }

  /**
   * Sends a message to a socket id
   * @param to who to send it so
   * @param msg the message to send
   * @returns a promise to await for the sending to complete
   */
  static sendMessage<K extends serializable>(to: number, msg: yieldedSocketMessage<K>): Promise<void> | undefined {
    const socket = socketS.getInstance().connections.get(to);
    if (socket && !socket.isClosed) {
      return socket.send(SocketMessage.encode(msg)).catch(() => socketS.getInstance().handleClose(socket));
    }
  }
  static getInstance() {
    return socketS.getInstance();
  }
}

export const socketS = singleton(() => new Socket(CONFIG.plugsFolder));
