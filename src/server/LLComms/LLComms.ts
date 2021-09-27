import { CONFIG } from "../../config.js";
import { chunkUp32, chunkUp16 } from "../../MISC/bits.ts";

export abstract class LLComms {
    constructor(){
    }
    async send(con: Deno.Conn, p: Uint8Array){
        return await con.write(p);
    }
    static prependSize(data: number[]){
        data.unshift(data.length)
    }
    static _setId(id: number): number[]{
        switch(CONFIG.LLJS.COMM_ID_SIZE){
            case 1: return [id];
            case 2: return chunkUp16(id);
            case 4: return chunkUp32(id);
            default: return [id];
        }
    }

    /**
     * Reads the entire incoming stream of data.
     * @param conn 
     */
    async readNext(conn: Deno.Conn){
        const sizeBuffer = new Uint8Array(4); // 32-bit bin representing the size.

        const r = await conn.read(sizeBuffer);
        const size = new DataView(sizeBuffer.buffer).getUint32(0);

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