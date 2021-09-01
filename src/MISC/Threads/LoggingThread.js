import {CONFIG} from '../../config.js';
import {LogLevel} from "../../components/Log.ts";

let logs = [];

function printLog(data){
    const logF = data.level === LogLevel.extreme ? console.warn : console.log;
    logF(`[${data.timeStamp}] - ${data.level} - ${data.message}`);
}
function pushLog(data, print = false){
    logs.push(data);
    if(print) printLog(data);
}
/**
 * 
 * @param {MessageEvent<LogShape>} e 
 */
self.onmessage = (e) => {
    if(e.data === "flush"){
        postMessage(logs);
        return;
    }
    if(e.data === "clear"){
        logs = [];
        return;
    }

    if(CONFIG.logLevel >= e.data.level){
    const additionalInfo = {...e.data, timeStamp: e.timeStamp};
    switch(e.data.level){
        case LogLevel.hidden: pushLog(additionalInfo, false); break;
        default: pushLog(additionalInfo, CONFIG.printLogToConsole);
    }
   }
}