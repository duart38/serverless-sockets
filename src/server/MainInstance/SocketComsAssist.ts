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
    runningModules: Deno.Process<Deno.RunOptions>[] = [];
    onReply: (d: {con: Deno.Conn, data: Uint8Array | undefined})=>void = (_d: {con: Deno.Conn, data: unknown})=>{};

    constructor(){
        super();
        this.listener = Deno.listen({hostname: CONFIG.INTERCOM.host, port: CONFIG.INTERCOM.port});
        for(let i = 0; i < CONFIG.N_MODULES; i++){
            console.log("\n\t\tspawning modules\n")
            this.runningModules.push(
              Deno.run({
                cmd: ['deno', 'run', '-A', './server/ModuleInstance/mod.ts']
              })
            )
          }
          console.log(this.runningModules);
          this.init();
    }

    private async *accept(){
        while(true){
            yield await this.listener.accept();
        }
    }
    private async *readFromCon(conn: Deno.Conn){
        while(true){
            yield await this.readNext(conn);
        }
    }

    private _wrapCursor(){
        if(this.connectionCursor > this.connections.length - 1){
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

    async *receive(con: Deno.Conn){
        for await(const data of this.readFromCon(con)) yield {
            conn: con,
            data
        };
    }

    async *acceptConnections(){
        for await(const con of this.accept()){
            this.connections.push(con);
            yield con;
        }
    }

    private receiveMsg(from: Deno.Conn){
        this.receive(from).next().then((x)=>{
            if(x.value) this.onReply({con: x.value.conn, data: x.value.data});
            this.receiveMsg(from);
        })
    }
    private init(){
        this.acceptConnections().next().then((c)=>{
            console.log(`received module connection:: ${c.value?.rid}`)
            if(c.value){
                this.receiveMsg(c.value)
            }
            this.init();
        })
    }
}
export const $SocketCommsAssist = singleton(()=> new SocketCommsAssist())