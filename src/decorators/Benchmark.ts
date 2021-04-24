import { PlugFunction } from "../interface/socketFunction.ts";

export default class Measure {
  /**
   * Time the length it takes for a function to execute when triggered.
   * @note Using this in production will result in a slow-down of ~1MS per timed call.
   * @param func function to wrap
   * @returns a new function that is wrapped with timing logic
   */
  static $Timing(func: PlugFunction): PlugFunction {
    return (socket, message) =>{
        const timeLabel = `[TIME] - (E:${message.event})_${Math.round(Math.random() * 1000)}`;
        console.time(timeLabel);
        func.call(func, socket, message);
        console.timeEnd(timeLabel);
    }
  }
}
