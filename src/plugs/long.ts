import type { PlugFunction } from "../interface/socketFunction.ts";

// supports multiple functions in one plug
export const longfunc: PlugFunction = (message, _from) => {
    let i = 0;
    setInterval(()=>{
        message.payload["name"] = "John" + i;
        i++;
    }, 10);
}