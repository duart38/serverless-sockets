// main entry point for upcoming scalability stuff

import { Log } from "../../components/Log.ts";
import { CONFIG } from "../../config.js";
import { Events, socketMessage } from "../../interface/message.ts";
import { syncInstruction } from "../../interface/sync.ts";
import ProxyManager from "../../MISC/ProxyManager.ts";
import { decorateAccessorsWP } from "../../MISC/utils.ts";
import { $CommunicationAssist, ModuleCommunicationAssistant } from "./CommunicationAssist.ts";

// auto launch a listener
// listen for events
// decode and run through event listener.

// ---
// event listener responds back on each yield with instructions on who to send it to.


export class ModuleInstance {
    
    private proxyManager = new ProxyManager();
    private CA: ModuleCommunicationAssistant;
    constructor(){
        this.CA = $CommunicationAssist.getInstance();
    }

    private parseIncoming(str: string): socketMessage{
        return JSON.parse(str);
    }
    
      // TODO: add back proxy support with the introduction of custom messages here
      /**
       * Decodes a string message into a socketMessage shape. Also freezes the decoded object to prevent re-shaping
       * @todo check on shape.
       * @param str 
       * @returns 
       */
    //   private proxyIncoming(str: string, client: WebSocket): socketMessage {
    //     return Log.silent(()=>{
    //       const incoming: socketMessage = this.parseIncoming(str)
    //       // deno-lint-ignore no-explicit-any
    //       const decorated = decorateAccessorsWP(incoming as any, async (v, p, obj)=>{
    //         await client.send(JSON.stringify(CONFIG.proxySyncSettings.instructionReply ? {
    //           event: Events.OBJ_SYNC,
    //           payload: {
    //             path: p,
    //             value: v,
    //             ins: syncInstruction.modify
    //           }
    //         } : obj as socketMessage))
    //       });
    //       this.proxyManager.add(client.conn.rid, ...decorated.revoke);
    //       return decorated.value;
    //     }) || {event: "404", payload: {}};
    //   }

      async run(){
        for await(const data of this.CA.itter(await this.CA.conn)){
            console.log("module side",data);
            (await this.CA.conn).write(new Uint8Array())
            // HandleEvent(CONFIG.proxySyncIncomingData ? this.proxyIncoming(ev, socket) : this.parseIncoming(ev), socket.conn.rid);
        }
      }

}


let mi = new ModuleInstance();
mi.run();

