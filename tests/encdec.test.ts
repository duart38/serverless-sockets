import { assertEquals, assertThrows } from "https://deno.land/std@0.106.0/testing/asserts.ts";
import { EventType } from "../src/interface/message.ts";
import { SocketMessage, yieldedSocketMessage } from "../src/interface/message.ts";
import { calculateUpdatePaths } from "../src/MISC/utils.ts";

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

Deno.test("SocketMessage SYNC works", () => {
    const originalMessage = SocketMessage.encode({
        event: "test",
        type: EventType.SYNC,
        payload: {
            name: "Duart Snel",
            age: 23,
            numbers: [1,2,3,4,5],
            nest: {
                nested: "hey"
            }
        }
    });
    
    const newMessage = SocketMessage.encode({
        event: "test",
        type: EventType.SYNC,
        payload: {
            name: "John Snel", // this changed
            age: 23,
            numbers: [1,2,3,4,5],
            nest: {
                nested: "hello world" // this changed
            }
        }
    });
    
    const syncingMessage: yieldedSocketMessage<number[][]> = {
        event: "test",
        type: EventType.SYNC,
        payload: calculateUpdatePaths(originalMessage, newMessage)
    }
    
    
    const old = SocketMessage.fromRaw(originalMessage);
    old.syncIncoming(SocketMessage.encode(syncingMessage));

    assertEquals(old.event, "test");
    assertEquals(old.eventType, EventType.SYNC);
    assertEquals(old.payload.name, "John Snel"  );
    assertEquals((old.payload.nest as Record<string, string>).nested, "hello world");
});

Deno.test("SocketMessage free method cleans up properly", () => {
    const raw = SocketMessage.encode({
        event: "test",
        payload: {count: 5},
    });
    const read = SocketMessage.fromRaw(raw);
    read.free();
    assertThrows(()=>{read.event});
    assertThrows(()=>{read.eventType});
    assertThrows(()=>{read.payload});
    assertThrows(()=>{read.sizeOfEvent});
    assertThrows(()=>{read.sizeOfMessage});

    assertEquals(read.raw, null);
});