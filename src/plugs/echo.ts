import type { PlugFunction } from "../interface/socketFunction.ts";
import Socket from "../server/Socket.ts";
export const echo: PlugFunction = (message, _from) => {
  Socket.broadcast(message);
};

// supports multiple functions in one plug
export const test: PlugFunction = (message, _from) => {
  console.log("some other function")
  for(let i = 0; i < 20; i++){
    message.payload["name"] = "John" + i;
  }
}

// export function* gen(message: any, _from: any){
//   yield 1;
// }