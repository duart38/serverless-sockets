import { assertEquals } from "https://deno.land/std@0.106.0/testing/asserts.ts";
import { chunkUp16, chunkUp32 } from "../src/MISC/bits.ts";

Deno.test("chunking up a 16 bit number works", () => {
    const chunkedUp = chunkUp16(5);
    assertEquals(chunkedUp[0], 0);
    assertEquals(chunkedUp[1], 5);
});

Deno.test("chunking up a 32 bit number works", () => {
    const chunkedUp = chunkUp32(5);
    assertEquals(chunkedUp[0], 0);
    assertEquals(chunkedUp[1], 0);
    assertEquals(chunkedUp[2], 0);
    assertEquals(chunkedUp[3], 5);
});

Deno.test("chunking up a large 16 bit number works", () => {
    const chunkedUp = chunkUp16(500);
    const res = new DataView(new Uint8Array(chunkedUp).buffer).getUint16(0);
    assertEquals(res, 500);
});

Deno.test("chunking up a large 32 bit number works", () => {
    const chunkedUp = chunkUp32(5000);
    const res = new DataView(new Uint8Array(chunkedUp).buffer).getUint32(0);
    assertEquals(res, 5000);
});