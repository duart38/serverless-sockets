import { LLDecodeType } from "./LLDecodeType.ts";

//pSize(32),pType(8),...pData(8)
export function decode(type:LLDecodeType, data: Uint8Array){
    return [
        /** UNSIGNED_NUMBER */
        ()=>{
            const dv = new DataView(data.buffer);
            switch(data.byteLength){
                case 1: return dv.getUint8(0);
                case 2: return dv.getUint16(0);
                case 4: return dv.getUint32(0);
                case 8: return dv.getBigUint64(0);
                default: return dv.getUint8(0);
            }
        },
        /** NUMBER */
        ()=>{
            const dv = new DataView(data.buffer);
            switch(data.byteLength){
                case 1: return dv.getInt8(0);
                case 2: return dv.getInt16(0);
                case 4: return dv.getInt32(0);
                case 8: return dv.getBigInt64(0);
                default: return dv.getInt8(0);
            }
        },
        /** STRING*/
        ()=>{
            return new TextDecoder().decode(data);
        },
        /** BOOLEAN */
        ()=>{
            return new Boolean(new DataView(data.buffer).getUint8(0));
        },
        /** JSON */
        ()=>{
            return JSON.parse(new TextDecoder().decode(data));
        },
        /** UNDEFINED */
        ()=>{
            return undefined;
        },/** NONE */
        ()=>{
            return data;
        }
    ][type]();
}