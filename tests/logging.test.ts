/*
 *   Copyright (c) 2022 Duart Snel

 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.

 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.

 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.106.0/testing/asserts.ts";
import { Log, LogLevel } from "../src/components/Log.ts";
import { CONFIG } from "../src/config.js";

CONFIG.logSizeLimit = 3;
CONFIG.logLevel = 99;
const logger = Log.getInstance();
console.log('setting the log size limit')

Deno.test("Logging has one instance", () => {
    assertEquals(logger, Log.getInstance());
});

Deno.test("get all logs work", async () => {
    await Promise.all([Log.info('info'), Log.error('error')])
    const logs = logger.getAllLogs();
    console.log(logs);

    assertEquals(logs[0].message, 'info');
    assertEquals(logs[1].message, 'error');
    Log.clearLogs();
});

Deno.test("info log works", async () => {
    await Log.info('test');
    const logs = Log.getInstance().getAllLogs();
    assertEquals(logs[0].level, LogLevel.info);
    assertEquals(logs[0].message, 'test');
    Log.clearLogs();
});

Deno.test("error log works", async () => {
    await Log.error('error');
    const logs = await Log.getInstance().getAllLogs();
    assertEquals(logs[0].level, LogLevel.error);
    assertEquals(logs[0].message, 'error');
    Log.clearLogs();
});

Deno.test("logger adheres to config limit", async () => {
    await Log.info(`initial`);
    for(let i = 0; i < CONFIG.logSizeLimit; i++){
        // introduce fake messages to simulate pressure or internal buffer
        Log.info(`padding ${i}`);
    }

    const logs = Log.getInstance().getAllLogs();
    assertStringIncludes(logs[0].message, 'initial');
    Log.clearLogs();
});
