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

import { assert, assertEquals, assertNotEquals } from "https://deno.land/std@0.158.0/testing/asserts.ts";
import { CONFIG } from "../src/config.js";
import { SocketMessage, yieldedSocketMessage } from "../src/interface/message.ts";
import TestHelper from "./TestHelper.ts";

const plugsDir = './tests/testPlugs';
try{
  Deno.mkdirSync(plugsDir, {});
// deno-lint-ignore no-empty
}catch(_){}
function writeToTemp(file:string, toYield: yieldedSocketMessage){
    Deno.writeTextFileSync(`${plugsDir}/${file}.ts`, `
export async function* _${toYield.event}(){
    yield ${JSON.stringify(toYield)}
}`)
}

writeToTemp('test', {event: 'unchanged', payload: {}});

CONFIG.plugsFolder = plugsDir;
CONFIG.secure = false;

const [ws] = await TestHelper.startServer(1);


Deno.test({
  sanitizeExit: false,
  sanitizeOps: false,
  sanitizeResources: false,
  name: "Server re-loads changed files", 
  async fn () {
    const res = TestHelper.waitForMessage(ws);
    const payload = { event: "test", payload: {} };
    ws.send(SocketMessage.encode(payload));
    writeToTemp('test', {event: 'changed', payload: {}});
    assertNotEquals((await res).event, "unchanged");
    assertEquals((await res).event, "changed");
  }
});


Deno.test({
  name: "Server takes in newly added files",
  sanitizeExit: false,
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    writeToTemp('newfunc', {payload: {}});
    const res = TestHelper.waitForMessage(ws);
    const payload = { event: "newfunc", payload: {} };
    ws.send(SocketMessage.encode(payload));
    console.log((await res).payload)
    assertEquals((await res).event, "newfunc")
  }
});


Deno.test({
  name: "Server does not crash on malformed request",
  sanitizeExit: false,
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    const payload = { event: "test", payload: {} };
    const temp = new Uint8Array(8);
    // below to fake out size as the server rejects early on incorrect sizes
    temp[0] = 0;
    temp[0] = 0;
    temp[0] = 0;
    temp[0] = 10;

    ws.send("LOL"); // malformed 1 (we dont support this)
    ws.send(temp); // malformed 2
    
    
    const res = TestHelper.waitForMessage(ws);
    ws.send(SocketMessage.encode(payload));
    assert((await res).event, "changed")
  }
});

self.addEventListener("unload", ()=>{
  Deno.removeSync(plugsDir, {recursive: true});
});
