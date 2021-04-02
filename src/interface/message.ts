/**
 * Shared interface between the client and the server.. the payload should have the following shape
 */
export interface socketMessage {
  event: string;
  payload: string;
}
