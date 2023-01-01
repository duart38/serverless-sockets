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

import {
  EventType,
  serializable,
  SocketMessage,
  yieldedSocketMessage,
} from "../interface/message.ts";

import { Watcher } from "../FS/FileWatcher.ts";
import { HandleEvent } from "./EventHandler.ts";
import { Log } from "../components/Log.ts";
import { CONFIG } from "../config.js";

import singleton from "https://raw.githubusercontent.com/grevend/singleton/main/mod.ts";

export default class Socket {
  public connections: Set<WebSocket>;
  public directoryWatcher: Watcher;
  protected instanceID: string;
  constructor(plugsDir: string) {
    this.connections = new Set();
    Log.info(`[+] Opening socket with function folder: ${plugsDir}`);
    this.directoryWatcher = new Watcher(plugsDir);
    this.instanceID = crypto.getRandomValues(new Uint32Array(2)).join("");
  }

  private handleClose(socket: WebSocket) {
    Log.silent(() => {
      socket.close();
    });
    this.connections.delete(socket);
    dispatchEvent(new Event(this.instanceID + "_disconnect"));
  }

  private waitForSocket(socket: WebSocket) {
    socket.onmessage = ({ data }) => {
      if (data instanceof ArrayBuffer) {
        const incoming = SocketMessage.fromBuffer(data);
        if (incoming.sizeOfMessage <= CONFIG.payloadLimit) {
          HandleEvent(incoming, socket);
        } else {
          Log.info(
            `payload with size ${incoming.sizeOfMessage} was rejected entrance.`,
          );
        }
      } else {
        Log.error(`Client sent incorrect data type -> ${typeof data}`);
      }
    };
  }

  /**
   * Accepts a request and upgrades it to a WebSocket connection.
   */
  public accept(req: Request) {
    if (req.headers.get("upgrade") != "websocket") {
      return new Response(null, { status: 501 });
    }

    const { response, socket } = Deno.upgradeWebSocket(req);
    this.connections.add(socket);
    dispatchEvent(new Event(this.instanceID + "_connect"));
    this.waitForSocket(socket);
    return response;
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
  static broadcast(data: yieldedSocketMessage, exclude?: WebSocket) {
    const socket = socketS.getInstance();
    socket.connections.forEach((s) => {
      if (s === exclude) return;
      if (s.readyState === 1) {
        data.type = EventType.BROADCAST;
        s.send(SocketMessage.encode(data));
      } else {
        Log.error("Attempting to send a message to a closed socket.");
        socket.handleClose(s);
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
  static sendMessage<K extends serializable>(
    to: WebSocket,
    msg: yieldedSocketMessage<K>,
  ) {
    if (to.readyState === 1) to.send(SocketMessage.encode(msg));
    else {
      Log.error("Attempting to send a message to a closed socket");
      Socket.getInstance().handleClose(to);
    }
  }
  static getInstance() {
    return socketS.getInstance();
  }
}

export const socketS = singleton(() => new Socket(CONFIG.plugsFolder));
