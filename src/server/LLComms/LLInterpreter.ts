// deno-lint-ignore-file no-explicit-any
import { CONFIG } from "../../config.js";
import Socket, { socketS } from "../Socket.ts";
import { LLComms } from "./LLComms.ts";
import { decode } from "./LLDecode.ts";

export class LLComsInterpreter {
    dataView: DataView;
    mem;
    cursor = 0;
    constructor(mem: Uint8Array){
        this.dataView = new DataView(mem.buffer);
        this.mem = mem;
    }

    fetchNextU8(){
        return this.dataView.getUint8(this.cursor++);
    }
    fetchNext8(){
        return this.dataView.getInt8(this.cursor++);
    }
    fetchNextU16(){
        const temp = this.dataView.getUint16(this.cursor);
        this.cursor += 2
        return temp;
    }
    fetchNext16(){
        const temp = this.dataView.getInt16(this.cursor);
        this.cursor += 2
        return temp;
    }
    fetchNextU32(){
        const temp = this.dataView.getUint32(this.cursor);
        this.cursor += 4;
        return temp;
    }
    fetchNext32(){
        const temp = this.dataView.getInt32(this.cursor);
        this.cursor += 4;
        return temp;
    }
    fetchNext(from: number, to: number){
        this.cursor += to - from;
        return this.mem.slice(from, to);
    }

    private _fetchID(){
        switch(CONFIG.LLJS.COMM_ID_SIZE){
            case 1: return this.fetchNextU8();
            case 2: return this.fetchNextU16();
            case 4: return this.fetchNextU32();
            default: return this.fetchNextU32();
        }
    }


    private execSocketMethod(funcID:number, params: unknown[]){
        [
            /** SEND_MESSAGE */
            ()=>{
                Socket.sendMessage(params[0] as number, params[1] as any);
            },
        ][funcID]()
    }

    

    /**
     * Gets the socket instance and maps out + execute the methods with the provided params
     */
    execImmediate(){
        // [id(~),  ...< pSize(32),pType(8),...pData(8) >]
        /**
         const constr = [
             SocketMethodMap.SEND_MESSAGE,, // id of method to call. we pre-maturely know the size and the type
            4, LLDecodeType.NUMBER, ...chunkUp32(to), // 4 bytes, type of number and the 'to' representing who to send the message to
            ...chunkUp32(msgD.byteLength), LLDecodeType.JSON, ...msgD // the size of the payload(msg), type of json, and the full data dumped
        ];
         */
        const funcID = this.fetchNextU8();
        const params = [];

        
        while(this.cursor < this.dataView.byteLength){
            const pSize = this.fetchNextU32();
            const pType = this.fetchNextU8();
            const pRaw = this.fetchNext(this.cursor, this.cursor + pSize) //this.dataView.buffer.slice(this.cursor, this.cursor + pSize);
            const decoded = decode(pType, pRaw)
            params.push(decoded);
        }
        this.execSocketMethod(funcID, params);
    }

    flush(){
        (this.dataView as unknown) = null;
    }
    
}