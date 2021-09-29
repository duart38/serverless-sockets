import { chunkUp32 } from "../MISC/bits.ts";

type serializable = number | string | Array<unknown> | Record<string, unknown>;
/**
 * Shared interface between the client and the server.. the payload should have the following shape
 */
export type socketMessage = Record<string, serializable>;
export interface yieldedSocketMessage {
  event: string;
  payload: Record<string, serializable>;
}

export enum Events {
  BROADCAST = "#$_BC",
  OBJ_SYNC = "#$_OBJ_SYNC",
  ERROR = "#$_ERR"
}

export class SocketMessage {
  raw: Uint8Array;

  private _sizeOfAll: number | undefined;
  private _sizeOfEvent: number | undefined;
  private _event: string | undefined;
  private _payload: socketMessage | undefined;

  private dv;
  constructor(incoming: Uint8Array){
    this.raw = incoming;
    this.dv = new DataView(incoming.buffer);
  }
  //TODO: proxy the payload when it is decoded for use if the CONFIG specifies this.

  get event(): string {
    // already loaded
    if(this._event) return this._event;
    // initial 8 because we are skipping the total size an the event size
    this._event = new TextDecoder().decode(this.raw.slice(8, 8+this.sizeOfEvent));
    return this._event;
  }
  get sizeOfMessage(): number{
    if(this._sizeOfAll) return this._sizeOfAll;
    this._sizeOfAll = this.dv.getUint32(0);
    return this._sizeOfAll;
  }
  get sizeOfEvent(): number{
    if(this._sizeOfEvent) return this._sizeOfEvent;
    this._sizeOfEvent = this.dv.getUint32(4);
    return this._sizeOfEvent;
  }
  get payload(): socketMessage {
    if(this._payload) return this._payload;
    // initial 8 because we are skipping the total size an the event size and then we skip the entire event with it's size
    this._payload = JSON.parse(new TextDecoder().decode(this.raw.slice(8+this.sizeOfEvent))) as socketMessage;
    return this._payload;
  }
  static encode(data: yieldedSocketMessage){
    const event = new TextEncoder().encode(data.event)
    const buff: number[] = [
      /**  event size */
      ...chunkUp32(event.length),
      ...event,
      ...new TextEncoder().encode(JSON.stringify(data.payload))
    ]
    buff.unshift(...chunkUp32(buff.length));
    return new Uint8Array(buff);
  }
  static fromRaw(data: Uint8Array){
    return new SocketMessage(data);
  }
  static fromBuffer(data: ArrayBufferLike){
    return new SocketMessage(new Uint8Array(data));
  }
}