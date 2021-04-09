import NonBlocking from "../decorators/NonBlocking.ts";
import { PlugFunction } from "../interface/socketFunction.ts";

function sleep(seconds: number) {
    var start = new Date().getTime(),
        delay = seconds * 1000;

    while (true) {
        if ((new Date().getTime() - start) > delay) {
            break;
        }
    }
}

function slow_task() {
    sleep(5);

    return [4, 8, 15, 16, 23, 42];
}
export const decorated = NonBlocking.$Call((socket, message) => {
    slow_task();
    console.log("reached");
});

// #### BAD CODE BELOW ####
// export const decorated: PlugFunction = (socket, message, from) => {
//     slow_task();
//     console.log("reached");
// }

export const dontBlock: PlugFunction = (socket, message) => {
    console.log("Hello i'm the last function");
}