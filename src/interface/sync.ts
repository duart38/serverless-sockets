export enum syncInstruction {
    modify, delete
}

export interface modificationInstruction {
    path: string[],
    value: unknown,
    ins: syncInstruction
}