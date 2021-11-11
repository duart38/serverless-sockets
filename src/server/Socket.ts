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
import { decorateAccessorsWP } from "../MISC/utils.ts";
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

  // private parseIncoming(str: string): socketMessage{
  //   return JSON.parse(str);
  // }
  // /**
  //  * Decodes a string message into a socketMessage shape. Also freezes the decoded object to prevent re-shaping
  //  * @deprecated not being used as of now, might re-introduce proxies in the future
  //  */
  // private proxyIncoming(str: string, client: WebSocket): socketMessage {
  //   return Log.silent(()=>{
  //     const incoming: socketMessage = this.parseIncoming(str)
  //     // deno-lint-ignore no-explicit-any
  //     const decorated = decorateAccessorsWP(incoming as any, async (v, p, obj)=>{
  //       await client.send(JSON.stringify(CONFIG.proxySyncSettings.instructionReply ? {
  //         event: Events.OBJ_SYNC,
  //         payload: {
  //           path: p,
  //           value: v,
  //           ins: syncInstruction.modify
  //         }
  //       } : obj as socketMessage))
  //     });
  //     this.proxyManager.add(client.conn.rid, ...decorated.revoke);
  //     return decorated.value;
  //   }) || {event: "404", payload: {}};
  // }


  private handleClose(socket: WebSocket){
    if(!socket.isClosed) socket.close();
    this.connections.delete(socket.conn.rid);
    dispatchEvent(new Event(this.instanceID+"_disconnect"));
    this.proxyManager.revokeAllFrom(socket.conn.rid);
  }
  
  private async waitForSocket(socket: WebSocket) {
    if(socket.isClosed) return;
    try {
      for await (const ev of socket) {
        if (ev instanceof Uint8Array) {
          // HandleEvent(CONFIG.proxySyncIncomingData ? this.proxyIncoming(ev, socket) : this.parseIncoming(ev), socket.conn.rid);
          const incoming = SocketMessage.fromRaw(ev);
          if(incoming.sizeOfMessage <= CONFIG.payloadLimit){
            HandleEvent(incoming, socket.conn.rid);
          }else{
            Log.info({level: LogLevel.extreme, message: `payload with size ${incoming.sizeOfMessage} was rejected entrance. RID: ${socket.conn.rid}`})
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
        dispatchEvent(new Event(this.instanceID+"_connect"));
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
  public onSocketConnect(callBack: ()=>void){
    addEventListener(this.instanceID+"_connect", callBack);
  }

  /**
   * Calls the callBack when a socket connects.
   */
  public onSocketDisconnect(callBack: ()=>void){
    addEventListener(this.instanceID+"_disconnect", callBack);
  }

  /**
   * Broadcasts a message to all connected clients.
   * @param data the data to send
   * @param exclude the socket id to exclude (tip: exclude yourself)
   */
  static broadcast(data: yieldedSocketMessage, exclude?: number){
    const socket = socketS.getInstance();
    socket.connections.forEach((s)=>{
      if(!s.isClosed  && s.conn.rid !== exclude) {
        s.send(SocketMessage.encode({event: Events.BROADCAST, payload: {...data.payload}})).catch(()=>socket.handleClose(s))
      }
  });
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
    const socket = socketS.getInstance().connections.get(to);
    if(socket && !socket.isClosed){
      return socket.send(SocketMessage.encode(msg)).catch(()=>socketS.getInstance().handleClose(socket));
    }
  }
  static getInstance(){
    return socketS.getInstance();
  }
}

export const socketS = singleton(()=> new Socket(CONFIG.plugsFolder))