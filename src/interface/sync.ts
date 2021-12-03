/**
 * Instructions that are used when the user is transferring data via sync.
 */
export enum syncInstruction {
  modify,
  delete,
}
/**
 * The shape of an instruction to modify or delete a portion of the destination data when the user is transferring data via sync.
 */
export interface modificationInstruction {
  path: string[];
  value: unknown;
  ins: syncInstruction;
}
