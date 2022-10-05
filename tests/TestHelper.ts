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

import { CONFIG } from "https://raw.githubusercontent.com/duart38/serverless-sockets/main/src/config.js";
import { SocketMessage } from "../src/mod.ts";
import { serve } from "https://deno.land/std@0.158.0/http/server.ts";
import Socket from "../src/server/Socket.ts";


export default class TestHelper {
  constructor() {
  }

  /**
   * Starts the serverless socket server and connects N sockets to it.
   * @param connectionAmount The amount of client sockets to connect.
   * @returns An array of connected websocket instances.
   */
  static startServer(
    connectionAmount: number,
  ): Promise<Array<WebSocket>> {
    const socket = Socket.getInstance();

    serve((r)=>socket.accept(r), CONFIG.INSECURE);

    const connections = [];
    for (let i = 0; i < connectionAmount; i++) {
      const conn = new WebSocket(`ws://localhost:${CONFIG.INSECURE.port}`);
      connections.push(
        new Promise<WebSocket>((res) => conn.onopen = () => res(conn))
      );
    }

    return Promise.all(connections);
  }

  /**
   * Wait for a socket to receive a message.
   * @param onSocket The socket which shall be receiving the message
   * @returns The resolved message.
   */
  static waitForMessage<T>(onSocket: WebSocket) {
    return new Promise<SocketMessage<T>>((res) => {
      console.log("\n\n\t###Waiting for message\n\n");
      const fn = async ({ data }: MessageEvent) => {
        console.log("message received");
        res(
          SocketMessage.fromBuffer(
            await (data as Blob).arrayBuffer(),
          ) as SocketMessage<T>,
        );
        onSocket.removeEventListener("message", fn);
      };
      
      onSocket.addEventListener("message", fn);
    });
  }
}