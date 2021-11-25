import { chunkUp32 } from "../MISC/bits.ts";
import { FreeAble } from "./mem.ts";

type serializable = number | string | Array<unknown> | Record<string, unknown>;
/**
 * Shared interface between the client and the server.. the payload should have the following shape
 */
export type socketMessage = Record<string, serializable>;

/**
 * The shape of the message that is yielded from socket functions (modules)
 */
export interface yieldedSocketMessage {
  type?: EventType
  event: string;
  payload: Record<string, serializable>;
}

/**
 * Global events that the socket server can send back to clients. depending on the value the client is to respond differently
 */
export enum EventType {
  /**
   * a regular message. oftentimes a reply to whoever sent the last message.
   */
  MESSAGE,
  /**
   * A broadcast event is sent to all clients.3
   */
  BROADCAST,
  /**
   * Reserved for authentication, cleans up code a bit.
   */
  AUTH,
  /**
   * Reserved for unknown errors
   */
  ERROR,
  /**
   * Sent back when the event was not found
   */
  NOT_FOUND,

  /**
   * Custom message, developers are free to do what they please here
   */
  CUSTOM_1,
  /**
   * Custom message, developers are free to do what they please here
   */
  CUSTOM_2,
  /**
   * Custom message, developers are free to do what they please here
   */
  CUSTOM_3,
  /**
   * Custom message, developers are free to do what they please here
   */
  CUSTOM_4,
  /**
   * Custom message, developers are free to do what they please here
   */
  CUSTOM_5,
}

export class SocketMessage implements FreeAble {
  /**
   * The raw data in it's original form.
   */
  raw: Uint8Array;

  private _eventType: EventType | undefined;
  private _sizeOfAll: number | undefined;
  private _sizeOfEvent: number | undefined;
  private _event: string | undefined;
  private _payload: socketMessage | undefined;

  private dv: DataView;
  /**
   * Constructs a SocketMessage which can be used for lazy evaluation of certain sections of the raw message.
   * @param incoming the raw incoming data
   */
  constructor(incoming: Uint8Array){
    this.raw = incoming;
    this.dv = new DataView(incoming.buffer);
  }

  /**
   * Lazily gets the event string from the raw data.
   * NOTE: calls the ```sizeOfEvent();``` to determine the string length.
   */
    get eventType(): EventType {
      // already loaded
      if(this._eventType) return this._eventType;
      // initial 8 because we are skipping the total size an the event size
      this._eventType = this.dv.getUint8(4)
      return this._eventType;
    }
  /**
   * Lazily gets the event string from the raw data.
   * NOTE: calls the ```sizeOfEvent();``` to determine the string length.
   */
  get event(): string {
    // already loaded
    if(this._event) return this._event;
    // initial 8 because we are skipping the total size an the event size
    this._event = new TextDecoder().decode(this.raw.slice(6, 6+this.sizeOfEvent));
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
    this._sizeOfEvent = this.dv.getUint8(5);
    return this._sizeOfEvent;
  }

  /**
   * Lazily gets and decodes the payload of the raw data.
   * NOTE: calls the ```sizeOfEvent();` to skip over it to the last sections which includes the payload data
   */
  get payload(): socketMessage {
    if(this._payload) return this._payload;
    // initial 8 because we are skipping the total size an the event size and then we skip the entire event with it's size
    this._payload = JSON.parse(new TextDecoder().decode(this.raw.slice(6+this.sizeOfEvent))) as socketMessage;
    return this._payload;
  }

  /**
   * Marks all memory associated with this object to be cleaned up by the GC.
   * > NOTE: There is no guarantee that this will be cleaned up nor can you (or us) predict WHEN it will be cleaned up.
   */
  free(){
    Object.keys(this).forEach((k)=>(this as Record<string, unknown>)[k] = null);
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

    const temp = new Uint8Array(6 + event.length + payload.length)
    temp.set(chunkUp32(temp.length), 0); // entire size
    temp[4] = data.type || EventType.MESSAGE; // event type
    temp[5] = event.length // event string size
    temp.set(event, 6); // event itself
    temp.set(payload, 6+event.length); // payload
    return temp;
  }

  /**
   *  Makes a new SocketMessage from the given raw data.
   * @returns SocketMessage
   */
  static fromRaw(data: Uint8Array){
    return new SocketMessage(data);
  }

  /**
   * Makes a new SocketMessage from the given buffer.
   * @returns SocketMessage
   */
  static fromBuffer(data: ArrayBufferLike){
    return new SocketMessage(new Uint8Array(data));
  }
}