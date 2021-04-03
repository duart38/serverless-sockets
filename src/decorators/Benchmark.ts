import { PlugFunction } from "../interface/socketFunction.ts";

export default class Measure {
  static $Timing(func: PlugFunction): PlugFunction {
    return (socket, message, from) =>{
        const timeLabel = `[TIME] - (E:${message.event})_(RID:${from.conn.rid})_${Math.round(Math.random() * 1000)}`;
        console.time(timeLabel);
        func.call(func, socket, message, from);
        console.timeEnd(timeLabel);
    }
  }
}
