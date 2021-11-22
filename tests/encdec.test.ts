import { assertEquals } from "https://deno.land/std@0.106.0/testing/asserts.ts";
import { EventType } from "../src/interface/message.ts";
import { SocketMessage, yieldedSocketMessage } from "../src/interface/message.ts";

Deno.test("SocketMessage encoding and decoding works", () => {
    const payload: yieldedSocketMessage = {
        type: EventType.MESSAGE,
        event: "test",
        payload: {count: 5}
    }
    const encoded = SocketMessage.encode(payload);
    const decoded = SocketMessage.fromRaw(encoded);

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

Deno.test("SocketMessage sizeOfEvent getter works", () => {
    const raw = SocketMessage.encode({
        event: "test",
        payload: {count: 5}
    });
    const read = SocketMessage.fromRaw(raw);
    assertEquals(read.sizeOfEvent, "test".length);
});

Deno.test("SocketMessage eventType getter works", () => {
    const raw = SocketMessage.encode({
        event: "test",
        payload: {count: 5},
        type: EventType.ERROR
    });
    const read = SocketMessage.fromRaw(raw);
    assertEquals(read.eventType, EventType.ERROR);
});

Deno.test("SocketMessage eventType auto-populates on absence", () => {
    const raw = SocketMessage.encode({
        event: "test",
        payload: {count: 5},
    });
    const read = SocketMessage.fromRaw(raw);
    assertEquals(read.eventType, EventType.MESSAGE);
});