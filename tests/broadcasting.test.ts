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

import { assertEquals } from "https://deno.land/std@0.158.0/testing/asserts.ts";
import { CONFIG } from "../src/config.js";
import { EventType, SocketMessage } from "../src/interface/message.ts";
import TestHelper from "./TestHelper.ts";

CONFIG.plugsFolder = "src/plugs";
CONFIG.secure = false;

const [ws_receiver, ws_sender] = await TestHelper.startServer(2);


Deno.test({
  sanitizeExit: false,
  sanitizeOps: false,
  sanitizeResources: false,
  name: "Broadcasting",
  fn: async (t) => {
    await t.step("Simple broadcast", async () => {
      const res = TestHelper.waitForMessage(ws_receiver);
      const testObject2 = { event: "echo", payload: { count: 10 } };
      ws_sender.send(SocketMessage.encode(testObject2))
      assertEquals((await res).eventType, EventType.BROADCAST);
    });

    await t.step("Broadcast after disconnect does not crash", () => {
      ws_receiver.close(); // close the receiver client
      const testObject2 = { event: "echo", payload: { count: 10 } };
      ws_sender.send(SocketMessage.encode(testObject2))
    });
  }
})