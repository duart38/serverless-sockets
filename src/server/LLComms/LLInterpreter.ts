// deno-lint-ignore-file no-explicit-any
import { CONFIG } from "../../config.js";
import Socket, { socketS } from "../Socket.ts";
import { decode } from "./LLDecode.ts";

export class LLComsInterpreter {
    dataView: DataView;
    cursor = 0;
    constructor(mem: Uint8Array){
        this.dataView = new DataView(mem);
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

    private _fetchID(){
        switch(CONFIG.LLJS.COMM_ID_SIZE){
            case 1: return this.fetchNextU8();
            case 2: return this.fetchNextU16();
            case 3: return this.fetchNextU32();
            default: return this.fetchNextU8();
        }
    }


    private execSocketMethod(funcID:number, ...params: unknown[]){
        [
            /** SEND_MESSAGE */
            ()=>{Socket.sendMessage.apply(null, params as any)},
        ][funcID]()
    }

    

    /**
     * Gets the socket instance and maps out + execute the methods with the provided params
     */
    execImmediate(){
        // [id(16),  ...< pSize(32),pType(8),...pData(8) >]
        const funcID = this._fetchID();
        const params = [];
        
        while(this.cursor < this.dataView.byteLength){
            const pSize = this.fetchNextU32();
            const pType = this.fetchNextU8();
            const pRaw = this.dataView.buffer.slice(this.cursor, this.cursor + pSize);
            params.push(decode(pType, pRaw));
        }
        this.execSocketMethod(funcID, params);
    }

    flush(){
        (this.dataView as unknown) = null;
    }
    
}