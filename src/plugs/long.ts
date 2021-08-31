import { ModuleGenerator } from "../interface/socketFunction.ts";
function sleep(seconds: number): Promise<void> {
    return new Promise((res)=>{
        var start = new Date().getTime(),
        delay = seconds * 1000;
        while (true) {
            if ((new Date().getTime() - start) > delay) {
                res();
            }
        }
    })
}

function slowTask() {
    sleep(5);

    return [4, 8, 15, 16, 23, 42];
}
export async function* long(): ModuleGenerator {
    console.log("reached");
    await new Promise(resolve => setTimeout(resolve, 5000));
    yield {
        event: "waiting",
        payload: {}
    }
}