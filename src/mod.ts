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

import { serve, serveTls } from "https://deno.land/std@0.158.0/http/server.ts";
import { CLI } from "./components/CLI.ts";
import { Log } from "./components/Log.ts";
import { CONFIG, configuration } from "https://raw.githubusercontent.com/duart38/serverless-sockets/main/src/config.js";
import { preLoadPlugs } from "./server/PreLoader.ts";
import { socketS } from "./server/Socket.ts";

export function start(config_override: Partial<configuration> = {}) {
  const cli = CLI.instance();
  cli.onReady().then(async () => {
    for(const [key, val] of Object.entries(config_override)){
      (CONFIG as unknown as Record<string, unknown>)[key] = val;
    }

    console.log("\n\n\tPID: " + Deno.pid);
    if (CONFIG.memoryMetrics.isOn) {
      setInterval(() => {
        const mem = Deno.memoryUsage();
        Log.info(`
        ----------- Process id: ${Deno.pid} -----------
        |\tTotal heap size: ${(mem.heapTotal / 100000).toFixed(2)} MB\t|
        |\tTotal heap used: ${(mem.heapUsed / 100000).toFixed(2)} MB\t|
        |\tExternal       : ${(mem.external / 100000).toFixed(2)}  MB\t|
        -----------------------------------------
        `);
      }, CONFIG.memoryMetrics.interval);
    }
    const socket = socketS.getInstance();
    Log.info(`Attempting to load initialization file from: ${Deno.cwd()}/INIT.ts`)

    await Log.silent(async ()=>{
      const init = await import(`file://${Deno.cwd()}/INIT.ts`);
      if(init) await init?.INIT(socket);
    })
    
    CONFIG.preloadPlugs && preLoadPlugs(CONFIG.plugsFolder);

    // ... other http code goes here ...
    if (CONFIG.secure) {
      Log.info(`websocket server is running on :${CONFIG.TLS.port}`);
      serveTls((r)=>socket.accept(r), CONFIG.TLS)
    } else {
      Log.info(`websocket server is running on :${CONFIG.INSECURE.port}`);
      serve((r)=>socket.accept(r), CONFIG.INSECURE)
    }
  }).catch((_: unknown) => {});
}

if (import.meta.main) {
  start();
}

export * from "./interface/message.ts";
export * from "./interface/socketFunction.ts";
export * from "./interface/sync.ts";
export * from "./server/Socket.ts";
export * from "./components/Log.ts";