// TODO: figure out if this is even needed
// the main idea is to assist the socket in sending messages (events) to the instances event handlers

import { CONFIG } from "../../config.js";
import { LLComms } from "../LLComms/LLComms.ts";
import singleton from "https://raw.githubusercontent.com/grevend/singleton/main/mod.ts";

/**
 * Assists with talking to the various spawned module instances
 */
export class SocketCommsAssist extends LLComms {
    listener: Deno.Listener;
    connections: Deno.Conn[] = [];
    connectionCursor = 0;
    constructor(){
        super();
        this.listener = Deno.listen({hostname: CONFIG.INTERCOM.host, port: CONFIG.INTERCOM.port});
    }

    private async *accept(){
        yield await this.listener.accept();
    }
    private async *readFromCon(conn: Deno.Conn){
        while(true){
            yield await this.readNext(conn);
        }
    }

    private _wrapCursor(){
        if(this.connectionCursor > this.connections.length){
            this.connectionCursor = 0;
        }else if (this.connectionCursor < 0){
            this.connectionCursor = this.connections.length - 1;
        }
    }
    bestFit(){
        const bestCon = this.connections[this.connectionCursor];
        this.connectionCursor++;
        this._wrapCursor();
        return bestCon;
    }

    async *fetchNext(){ // raw
        for await(const con of this.accept()){
            this.connections.push(con);
            for await(const data of this.readFromCon(con)) yield {
                conn: con,
                data
            };
        }
    }
}
export const $SocketCommsAssist = singleton(()=> new SocketCommsAssist())