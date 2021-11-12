import {CONFIG} from '../../config.js';
import {LogLevel, LogType} from "../../components/Log.ts";

let logs = [];

function printLog(data){
    const logF = data.type === LogType.error ? console.error : console.log;
    logF(`[${new Date(data.timeStamp)}] - ${data.level} - ${data.message}`);
}
function pushLog(data, print = false){
    logs.push(data);
    if(logs.length > CONFIG.logSizeLimit) logs.shift();
    if(print) printLog(data);
}
/**
 * 
 * @param {MessageEvent<LogShape>} e 
 */
self.onmessage = (e) => {
    if(e.data === "flush"){
        postMessage(logs);
        logs = [];
        return;
    }
    if(e.data === "clear"){
        logs = [];
        return;
    }
    if(e.data?.config){
        delete e.data.config;
        Object.assign(CONFIG, e.data);
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