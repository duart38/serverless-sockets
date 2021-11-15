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

Deno.test("SocketMessage event getter works", () => {
    const raw = SocketMessage.encode({
        event: "test",
        payload: {count: 5}
    });
    const read = SocketMessage.fromRaw(raw);

    assertEquals(read.event, "test");
});

Deno.test("SocketMessage payload getter works", () => {
    const raw = SocketMessage.encode({
        event: "test",
        payload: {count: 5}
    });
    const read = SocketMessage.fromRaw(raw);

    assertEquals(read.payload, {count: 5});
});

Deno.test("SocketMessage sizeOfMessage getter works", () => {
    const raw = SocketMessage.encode({
        event: "test",
        payload: {count: 5}
    });
    const read = SocketMessage.fromRaw(raw);

    const dv = new DataView(raw.buffer);
    assertEquals(read.sizeOfMessage, dv.getUint32(0));
});

Deno.test("SocketMessage sizeOfEventgetter works", () => {
    const raw = SocketMessage.encode({
        event: "test",
        payload: {count: 5}
    });
    const read = SocketMessage.fromRaw(raw);
    assertEquals(read.sizeOfEvent, "test".length);
});