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

function slowTask() {
    sleep(5);

    return [4, 8, 15, 16, 23, 42];
}
export const decorated: PlugFunction = NonBlocking.$Call((_socket, _message) => {
    slowTask();
    console.log("reached");
});

// #### BAD CODE BELOW ####
// export const decorated: PlugFunction = (socket, message, from) => {
//     slowTask();
//     console.log("reached");
// }

export const dontBlock: PlugFunction = (_socket, _message) => {
    console.log("Hello i'm the last function");
}