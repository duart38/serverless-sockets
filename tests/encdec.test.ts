import { assert, assertEquals, fail } from "https://deno.land/std@0.106.0/testing/asserts.ts";
import { serve } from "https://deno.land/std@0.90.0/http/server.ts";
import { CONFIG } from "../src/config.js";
import { SocketMessage } from "../src/interface/message.ts";
import { socketS } from "../src/server/Socket.ts";

Deno.test("SocketMessage encoding and decoding works", () => {
    const payload = {
        event: "test",
        payload: {count: 5}
    }
    const encoded = SocketMessage.encode(payload);
    const decoded = SocketMessage.fromRaw(encoded)

    assertEquals(decoded.event, "test");
    assertEquals(decoded.payload.count, 5);
});

Deno.test("SocketMessage encoding and decoding is circular", () => {
    const payload = {
        event: "test",
        payload: {count: 5}
    }
    const decoded = SocketMessage.fromRaw(SocketMessage.encode(SocketMessage.fromRaw(SocketMessage.encode(SocketMessage.fromRaw(SocketMessage.encode(payload))))));

    assertEquals(decoded.event, "test");
    assertEquals(decoded.payload.count, 5);
});