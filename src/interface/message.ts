type serializable = number | string | Array<unknown> | Record<string, unknown> | boolean;
/**
 * Shared interface between the client and the server.. the payload should have the following shape
 */
export interface socketMessage {
  payload: Record<string, serializable>;
}
export interface yieldedSocketMessage {
  event: string;
  payload: Record<string, serializable>;
}


export enum Events {
  BROADCAST = "#$_BC",
  OBJ_SYNC = "#$_OBJ_SYNC",
  ERROR = "#$_ERR"
}