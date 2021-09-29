import type { ServerRequest } from "https://deno.land/std@0.90.0/http/server.ts";
import { Events, SocketMessage, socketMessage, yieldedSocketMessage } from "../interface/message.ts";

import {
  acceptWebSocket,
  isWebSocketCloseEvent,
  WebSocket,
} from "https://deno.land/std@0.90.0/ws/mod.ts";
import { Watcher } from "../FS/FileWatcher.ts";
import { HandleEvent } from "./EventHandler.ts";
import { Log, LogLevel } from "../components/Log.ts";
import { decorateAccessorsWP, payloadCeiling } from "../MISC/utils.ts";
import { syncInstruction } from "../interface/sync.ts";
import { CONFIG } from "../config.js";

import singleton from "https://raw.githubusercontent.com/grevend/singleton/main/mod.ts";
import ProxyManager from "../MISC/ProxyManager.ts";

export default class Socket {
  public connections: Map<number, WebSocket>;
  private proxyManager = new ProxyManager();
  public directoryWatcher: Watcher;
  protected instanceID: string;
  constructor(plugsDir: string) {
    Log.info({level: LogLevel.medium, message: `[+] Opening socket with function folder: ${plugsDir}`});
    this.directoryWatcher = new Watcher(plugsDir);
    this.instanceID = crypto.getRandomValues(new Uint32Array(2)).join("");
    this.connections = new Map();
  }

  private parseIncoming(str: string): socketMessage{
    return JSON.parse(str);
  }
  /**
   * Decodes a string message into a socketMessage shape. Also freezes the decoded object to prevent re-shaping
   * @todo check on shape.
   * @param str 
   * @returns 
   */
  private proxyIncoming(str: string, client: WebSocket): socketMessage {
    return Log.silent(()=>{
      const incoming: socketMessage = this.parseIncoming(str)
      // deno-lint-ignore no-explicit-any
      const decorated = decorateAccessorsWP(incoming as any, async (v, p, obj)=>{
        await client.send(JSON.stringify(CONFIG.proxySyncSettings.instructionReply ? {
          event: Events.OBJ_SYNC,
          payload: {
            path: p,
            value: v,
            ins: syncInstruction.modify
          }
        } : obj as socketMessage))
      });
      this.proxyManager.add(client.conn.rid, ...decorated.revoke);
      return decorated.value;
    }) || {event: "404", payload: {}};
  }


  private handleClose(socket: WebSocket){
    if(!socket.isClosed) socket.close();
    this.connections.delete(socket.conn.rid);
    dispatchEvent(new Event(this.instanceID+"_disconnect"));
    this.proxyManager.revokeAllFrom(socket.conn.rid);
  }
  private async waitForSocket(socket: WebSocket) {
    try {
      for await (const ev of socket) {
        if (ev.constructor === Uint8Array) {// TODO: instanceof checks are slow.. maybe try something else
          // HandleEvent(CONFIG.proxySyncIncomingData ? this.proxyIncoming(ev, socket) : this.parseIncoming(ev), socket.conn.rid);
          const incoming = SocketMessage.fromRaw(ev);
          if(incoming.sizeOfMessage <= CONFIG.payloadLimit){
            HandleEvent(incoming, socket.conn.rid);
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
  static broadcast(data: Omit<socketMessage, "event">){
    socketS.getInstance().connections.forEach((s)=>{if(!s.isClosed) s.send(JSON.stringify({
      ...data,
      event: Events.BROADCAST
    }))});
  }
  /**
   * Ban hammer.
   */
  public kickAll(){
    this.connections.forEach(x=>this.handleClose(x))
  }

  /**
   * Sends a message to a socket id
   * @param to who to send it so
   * @param msg the message to send
   * @returns a promise to await for the sending to complete
   */
  static sendMessage(to: number, msg: yieldedSocketMessage): Promise<void> | undefined {
    return socketS.getInstance().connections.get(to)?.send(SocketMessage.encode(msg));
  }
  static getInstance(){
    return socketS.getInstance();
  }
}

export const socketS = singleton(()=> new Socket(CONFIG.plugsFolder))