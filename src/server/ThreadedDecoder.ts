import Thread from "https://raw.githubusercontent.com/duart38/Thread/master/Thread.ts";
import { socketMessage } from "../interface/message.ts";
type smBinding = (sm: socketMessage)=>void;
/**
 * Decodes instructions from an N amount of threads.
 * Useful when the byte-streams coming in are large or complicated.
 */
export default class ThreadedDecoder{
    private bound: smBinding;
    private cursor: number;
    private threadCount: number;
    private threadPool!: Array<Thread<socketMessage>>;
    constructor(threadCount = 2){
        this.cursor = 0;
        this.threadCount = threadCount;
        this.bound = (sm)=>{console.log(sm)};
        this.spawnThreads();
    }
    private threadCode(e: MessageEvent): socketMessage {
        return JSON.parse(e.data);
    }
    private spawnThreads(){
        this.threadPool = [];
        for(let i = 0; i < this.threadCount; i++){
            this.threadPool.push(new Thread(this.threadCode));
            this.threadPool[i].onMessage(this.bound)
        }
    }

    public bind(func: smBinding){
        this.bound = func;
    }
}