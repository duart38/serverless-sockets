import { assertEquals } from "https://deno.land/std@0.106.0/testing/asserts.ts";
import { SocketMessage } from "../src/interface/message.ts";

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