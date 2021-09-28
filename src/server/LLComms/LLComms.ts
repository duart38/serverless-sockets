import { Log, LogLevel } from "../../components/Log.ts";
import { CONFIG } from "../../config.js";
import { chunkUp32, chunkUp16 } from "../../MISC/bits.ts";

export abstract class LLComms {
    constructor(){
    }
    async send(con: Deno.Conn, p: Uint8Array){
        return await con.write(p);
    }
    static prependSize(data: number[]){
        data.unshift(...chunkUp32(data.length));
    }

    /**
     * Returns the amount of bytes to be allocated to the RID section of a payload
     */
    static getRIDAllocation(): number {
        if(CONFIG.maxConnections <= 255){ // 8-bit allocation for the ID
            return 1;
        }else if (CONFIG.maxConnections <= 65535){
            return 2;
        }else if(CONFIG.maxConnections <= 0x7FFFFFFE){
            return 4;
        }else{
            Log.error({level: LogLevel.medium, message: `WARNING: unable to parse required maxConnections from CONFIG. This could lead to allocation issues. value: ${CONFIG.maxConnections}`})
            return 4
        }
    }
    /**
     * chunks up a number for the  rid (Resource ID) section of a payload.
     * This method allocates based on the amount of allowed connections.+
     * @param id the resource id for reference
     * @returns the chunked up value.
     */
    static chunkUpRID(id: number): number[]{
        
        if(LLComms.getRIDAllocation() === 1){ // 8-bit allocation for the ID
            return [id];
        }else if (LLComms.getRIDAllocation() === 2){ // 16
            return chunkUp16(id);
        }else if(LLComms.getRIDAllocation() === 4){ // 32
            return chunkUp32(id);
        }else{
            Log.error({level: LogLevel.medium, message: `WARNING: unable to parse required maxConnections from CONFIG. This could lead to allocation issues. value: ${CONFIG.maxConnections}`})
            return chunkUp32(id);
        }
    }
    static combineRID(raw: Uint8Array){
        const sDV = new DataView(raw.buffer);
        if(LLComms.getRIDAllocation() === 1){ // 8-bit allocation for the ID
            return sDV.getUint8(0);
        }else if (LLComms.getRIDAllocation() === 2){ // 16
            return sDV.getUint16(0);
        }else if(LLComms.getRIDAllocation() === 4){ // 32
            return sDV.getUint32(0);
        }else{
            return sDV.getUint32(0);
        }
    }

    /**
     * Reads the entire incoming stream of data.
     * @param conn 
     */
    async readNext(conn: Deno.Conn){
        const sizeBuffer = new Uint8Array(LLComms.getRIDAllocation()); // 32-bit bin representing the size.
        const r = await conn.read(sizeBuffer);
        const sDV = new DataView(sizeBuffer.buffer);
        let size;
        if(LLComms.getRIDAllocation() === 1){ // 8-bit allocation for the ID
            size = sDV.getUint8(0);
        }else if (LLComms.getRIDAllocation() === 2){ // 16
            size = sDV.getUint16(0);
        }else if(LLComms.getRIDAllocation() === 4){ // 32
            size = sDV.getUint32(0);
        }else{
            size = sDV.getUint32(0);
        }


        if(r && size > 0){
            const rest = new Uint8Array(size);
            await conn.read(rest);
            return rest;
        }
    }

    async *itter(conn: Deno.Conn){
        while(true){
            let x = await this.readNext(conn);
            if(!x) continue;
            yield x;
        }
    }
}