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
import { decorateAccessorsWP, payloadCeiling } from "../MISC/utils.ts";
import { syncInstruction } from "../interface/sync.ts";
import { CONFIG } from "../config.js";

import singleton from "https://raw.githubusercontent.com/grevend/singleton/main/mod.ts";

export default class Socket {
  public connections: Map<number, WebSocket>;
  public directoryWatcher: Watcher;
  protected instanceID: string;
  constructor(plugsDir: string) {
    this.directoryWatcher = new Watcher(plugsDir);
    this.instanceID = crypto.getRandomValues(new Uint32Array(2)).join("");
    this.connections = new Map();
  }

  /**
   * Decodes a string message into a socketMessage shape. Also freezes the decoded object to prevent re-shaping
   * @todo check on shape.
   * @param str 
   * @returns 
   */
  private decodeStringMessage(str: string, client: WebSocket): socketMessage {
    return Object.freeze($Log.getInstance().silent(()=>{ // TODO: this shit is garbage...
      const t: socketMessage = JSON.parse(str);
      return decorateAccessorsWP(t as any, async (v, p)=>{
        // TODO: could it be faster if we binary encode it immediately? since we don't make use of the stringified value
        await client.send(JSON.stringify({ // TODO: move json stringify to a method for hot func
          event: "",
          payload: {
            path: p,
            value: v,
            ins: syncInstruction.modify
          }
        } as socketMessage))
      });
    }) || {event: "404", payload: {}});
  }


  private handleClose(socket: WebSocket){
    if(!socket.isClosed) socket.close();
    this.connections.delete(socket.conn.rid);
    dispatchEvent(new Event(this.instanceID+"_disconnect"));
  }
  private async waitForSocket(socket: WebSocket) {
    try {
      for await (const ev of socket) {
        if (typeof ev === "string" && !payloadCeiling(ev)) {
          HandleEvent(this.decodeStringMessage(ev, socket), socket.conn.rid);
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
  public broadcast(data: Omit<socketMessage, "event">){
    this.connections.forEach((s)=>{if(!s.isClosed) s.send(JSON.stringify({
      ...data,
      event: "#$_BC" // TODO: move to a method
    }))});
  }
  /**
   * Ban hammer.
   */
  public kickAll(){
    this.connections.forEach(x=>this.handleClose(x))
  }
}

export const socketS = singleton(()=> new Socket(CONFIG.plugsFolder))