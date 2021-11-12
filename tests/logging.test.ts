import { assertEquals, assertNotEquals } from "https://deno.land/std@0.106.0/testing/asserts.ts";
import { Log, LogLevel, LogType } from "../src/components/Log.ts";
import { CONFIG } from "../src/config.js";

CONFIG.logSizeLimit = 3;
const logger = Log.getInstance();
console.log('setting the log size limit')

Deno.test("Logging has one instance", () => {
    assertEquals(logger, Log.getInstance());
});

Deno.test("get all logs work", async () => {
    Log.info({level: LogLevel.low, message: 'info'})
    Log.error({level: LogLevel.low, message: 'error'})
    const logs = await Log.getInstance().getAllLogs();

    assertEquals(logs[0].message, 'info');
    assertEquals(logs[1].message, 'error');
});

Deno.test("info log works", async () => {
    Log.info({level: LogLevel.low, message: 'test'});
    const logs = await Log.getInstance().getAllLogs();
    assertEquals(logs[0].type, LogType.info);
    assertEquals(logs[0].level, LogLevel.low,);
    assertEquals(logs[0].message, 'test');
});

Deno.test("error log works", async () => {
    Log.error({level: LogLevel.low, message: 'error'});
    const logs = await Log.getInstance().getAllLogs();
    assertEquals(logs[0].type, LogType.error);
    assertEquals(logs[0].level, LogLevel.low,);
    assertEquals(logs[0].message, 'error');
});

Deno.test("logger adheres to config limit", async () => {
    Log.info({level: LogLevel.low, message: `initial`});
    for(let i = 0; i < CONFIG.logSizeLimit; i++){
        // introduce fake messages to simulate pressure or internal buffer
        Log.info({level: LogLevel.low, message: `padding ${i}`});
    }

    const logs = await Log.getInstance().getAllLogs();
    assertNotEquals(logs[0].message, 'initial');
});
