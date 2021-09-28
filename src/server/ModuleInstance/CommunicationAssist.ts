import singleton from "https://raw.githubusercontent.com/grevend/singleton/main/mod.ts";
import { CONFIG } from "../../config.js";
import { socketMessage } from "../../interface/message.ts";
import { chunkUp16, chunkUp32 } from "../../MISC/bits.ts";
import { LLComms } from "../LLComms/LLComms.ts";
import { LLDecodeType } from "../LLComms/LLDecodeType.ts";
import { SocketMethodMap } from "../MainInstance/SocketExposedMethods.ts";


/**
 * Low level communication assistant class.
 * 
 * [sizeOfAll,id(16),  ...< pSize(32),pType(8),...pData(8) >] 
 * ... : more or equals to 1
 * <>  : section of bytes belonging to each other
 * (n) : byte length
 */
export class ModuleCommunicationAssistant extends LLComms{
    conn: Promise<Deno.Conn>;
    constructor(){
        super();
        this.conn = Deno.connect({hostname: CONFIG.INTERCOM.host, port: CONFIG.INTERCOM.port});
    }

    static async sendMessage(to: number, msg: socketMessage){
        const msgD = new TextEncoder().encode(JSON.stringify(msg)); // the slow part... 
        const constr = [
            SocketMethodMap.SEND_MESSAGE, // id of method to call. we pre-maturely know the size and the type
            ...chunkUp32(4), LLDecodeType.NUMBER, ...chunkUp32(to), // 4 bytes, type of number and the 'to' representing who to send the message to
            ...chunkUp32(msgD.byteLength), LLDecodeType.JSON, ...msgD // the size of the payload(msg), type of json, and the full data dumped
        ];
        ModuleCommunicationAssistant.prependSize(constr);
        const LLMsg = new Uint8Array(constr);
        (await $CommunicationAssist.getInstance().conn).write(LLMsg);
    }
}
export const $CommunicationAssist = singleton(()=> new ModuleCommunicationAssistant())