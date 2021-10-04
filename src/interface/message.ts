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
  /**
   * The raw data in it's original form.
   */
  raw: Uint8Array;

  private _sizeOfAll: number | undefined;
  private _sizeOfEvent: number | undefined;
  private _event: string | undefined;
  private _payload: socketMessage | undefined;

  private dv;
  /**
   * Constructs a SocketMessage which can be used for lazy evaluation of certain sections of the raw message.
   * @param incoming the raw incoming data
   */
  constructor(incoming: Uint8Array){
    this.raw = incoming;
    this.dv = new DataView(incoming.buffer);
  }
  //TODO: proxy the payload when it is decoded for use if the CONFIG specifies this.

  /**
   * Lazily gets the event string from the raw data.
   * NOTE: calls the ```sizeOfEvent();``` to determine the string length.
   */
  get event(): string {
    // already loaded
    if(this._event) return this._event;
    // initial 8 because we are skipping the total size an the event size
    this._event = new TextDecoder().decode(this.raw.slice(5, 5+this.sizeOfEvent));
    return this._event;
  }
  /**
   * Lazily gets the size of the entire raw data.
   */
  get sizeOfMessage(): number{
    if(this._sizeOfAll) return this._sizeOfAll;
    this._sizeOfAll = this.dv.getUint32(0);
    return this._sizeOfAll;
  }
  /**
   * Lazily gets the size of the event string (used to decode the event string)
   */
  get sizeOfEvent(): number{
    if(this._sizeOfEvent) return this._sizeOfEvent;
    this._sizeOfEvent = this.dv.getUint8(4);
    return this._sizeOfEvent;
  }

  /**
   * Lazily gets and decodes the payload of the raw data.
   * NOTE: calls the ```sizeOfEvent();` to skip over it to the last sections which includes the payload data
   */
  get payload(): socketMessage {
    if(this._payload) return this._payload;
    // initial 8 because we are skipping the total size an the event size and then we skip the entire event with it's size
    this._payload = JSON.parse(new TextDecoder().decode(this.raw.slice(5+this.sizeOfEvent))) as socketMessage;
    return this._payload;
  }

  /**
   * Encodes a JSON message to the byte array required to communicate between clients and servers.
   * @param data 
   * @returns 
   */
  static encode(data: yieldedSocketMessage){
    const encoder = new TextEncoder();
    const event = encoder.encode(data.event)
    const payload = encoder.encode(JSON.stringify(data.payload))

    const temp = new Uint8Array(5 + event.length + payload.length)
    temp.set(chunkUp32(temp.length), 0); // entire size
    temp[4] = event.length // event size
    temp.set(event, 5); // event itself
    temp.set(payload, 5+event.length); // payload
    return temp;
  }
  static fromRaw(data: Uint8Array){
    return new SocketMessage(data);
  }
  static fromBuffer(data: ArrayBufferLike){
    return new SocketMessage(new Uint8Array(data));
  }
}