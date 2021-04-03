import Measure from "../decorators/Benchmark.ts";

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
export const decorated = Measure.$Timing((socket, message, from) => {
    slow_task();
    console.log("reached");
})