/**
 * Shared interface between the client and the server.. the payload should have the following shape
 */
export interface socketMessage {
  event: string;
  payload: Record<string, unknown>;
}

export enum Events {
  BROADCAST = "#$_BC",
  OBJ_SYNC = "#$_OBJ_SYNC"
}