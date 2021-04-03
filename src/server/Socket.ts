import type { ServerRequest } from "https://deno.land/std@0.90.0/http/server.ts";
import type { socketMessage } from "../interface/message.ts";

import {
  acceptWebSocket,
  isWebSocketCloseEvent,
  WebSocket,
} from "https://deno.land/std@0.90.0/ws/mod.ts";
import { Watcher } from "../FS/FileWatcher.ts";
import { HandleEvent } from "./EventHandler.ts";
import { $Log } from "../decorators/Log.ts";

export default class Socket {
  //public connections: WebSocket[] = [];
  public connections: Map<number, WebSocket>;
  public directoryWatcher: Watcher;
  protected instanceID: string;
  constructor(plugsDir: string) {
    this.directoryWatcher = new Watcher(plugsDir);
    this.instanceID = crypto.getRandomValues(new Uint32Array(2)).join("");
    this.connections = new Map();
  }

  private decodeStringMessage(str: string): socketMessage {
    return Object.freeze($Log.getInstance().silent(()=>JSON.parse(str)) || {event: "404", payload: "not found"});
  }
  private handleClose(socket: WebSocket){
    if(!socket.isClosed) socket.close();
    this.connections.delete(socket.conn.rid);
    dispatchEvent(new Event(this.instanceID+"_disconnect"));
  }
  private async waitForSocket(socket: WebSocket) {
    try {
      for await (const ev of socket) {
        if (typeof ev === "string") {
          HandleEvent(Object.freeze(this), this.decodeStringMessage(ev), socket);
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

  public accept(req: ServerRequest) {
    const { conn, r: bufReader, w: bufWriter, headers } = req;
    acceptWebSocket({ conn, bufReader, bufWriter, headers })
      .then((socket) => {
        this.connections.set(socket.conn.rid, socket);
        dispatchEvent(new Event(this.instanceID+"_connect"));
        this.waitForSocket(socket);
      })
      .catch(async (err: unknown) => {
        console.error(`failed to accept websocket: ${err}`);
        await req.respond({ status: 400 });
      });
  }

  public onSocketConnect(callBack: ()=>void){
    addEventListener(this.instanceID+"_connect", callBack);
  }
  public onSocketDisconnect(callBack: ()=>void){
    addEventListener(this.instanceID+"_disconnect", callBack);
  }
  public broadcast(data: socketMessage){
    this.connections.forEach((s)=>{if(!s.isClosed) s.send(JSON.stringify(data))});
  }
  /**
   * Ban hammer.
   */
  public kickAll(){
    this.connections.forEach(x=>this.handleClose(x))
  }
}
