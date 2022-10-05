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

import { assert, assertEquals, fail } from "https://deno.land/std@0.158.0/testing/asserts.ts";
import { CONFIG } from "../src/config.js";
import { SocketMessage } from "../src/interface/message.ts";
import TestHelper from "./TestHelper.ts";

CONFIG.plugsFolder = "src/plugs";
CONFIG.secure = false;

const [ws] = await TestHelper.startServer(1);


Deno.test({
  sanitizeOps: false,
  sanitizeResources: false,
  sanitizeExit: false,
  name: "Yielding",
  fn: async (t) => {

    await t.step("Single yield", async () => {
      const res = TestHelper.waitForMessage(ws)
      const payload = { event: "multiyield", payload: { count: 1 } };
      ws.send(SocketMessage.encode(payload));
      assertEquals((await res).event, "multiyield")
    });

    await t.step("Multi yields", () => {
      const timeout = setTimeout(() => fail("Timeout"), 8000);
      let count = 0;
      const fn = () => {
        count++;
        if (count > 3) {
          assert("SOLID");
          clearTimeout(timeout);
          ws.removeEventListener("message", fn);
        }
      }
      ws.addEventListener("message", fn);
      const payload = { event: "multiyield", payload: { count: 4 } }
      ws.send(SocketMessage.encode(payload));
    });

  }
});
