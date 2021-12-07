import { assertEquals } from "https://deno.land/std@0.106.0/testing/asserts.ts";
import { calculateUpdatePaths } from "../src/MISC/utils.ts";
Deno.test("CUP captures change", () => {
    const _arr1 = [0,0,0];
    const arr1 = new Uint8Array(_arr1.length);
    arr1.set(_arr1,0);

    const _arr2 = [0,5,0];
    const arr2 = new Uint8Array(_arr2.length);
    arr2.set(_arr2,0);

    const result = calculateUpdatePaths(arr1, arr2);

    assertEquals(result[1][0], 1); // position
    assertEquals(result[1][1], 5); // update
});

Deno.test("CUP captures change group with unchanged tail", () => {
    const _arr1 = [0,0,0,0,0,0,0];
    const arr1 = new Uint8Array(_arr1.length);
    arr1.set(_arr1,0);

    const _arr2 = [0,0,0,5,6,7,0];
    const arr2 = new Uint8Array(_arr2.length);
    arr2.set(_arr2,0);

    const result = calculateUpdatePaths(arr1, arr2);

    assertEquals(result[1][0], 3); // position
    assertEquals(result[1], [3,5,6,7]); // update
});

Deno.test("CUP captures change group at tail", () => {
    const _arr1 = [0,0,0,0,0,0];
    const arr1 = new Uint8Array(_arr1.length);
    arr1.set(_arr1,0);

    const _arr2 = [0,0,0,5,6,7];
    const arr2 = new Uint8Array(_arr2.length);
    arr2.set(_arr2,0);

    const result = calculateUpdatePaths(arr1, arr2);

    assertEquals(result[1][0], 3); // position
    assertEquals(result[1], [3,5,6,7]); // update
});

Deno.test("CUP captures change group at head", () => {
    const _arr1 = [0,0,0,0,0,0];
    const arr1 = new Uint8Array(_arr1.length);
    arr1.set(_arr1,0);

    const _arr2 = [5,6,7,0,0,0,];
    const arr2 = new Uint8Array(_arr2.length);
    arr2.set(_arr2,0);

    const result = calculateUpdatePaths(arr1, arr2);

    assertEquals(result[1][0], 0); // position
    assertEquals(result[1], [0,5,6,7]); // update
});

Deno.test("CUP captures increase in size", () => {
    const _arr1 = [0,0,0,0,0,0];
    const arr1 = new Uint8Array(_arr1.length);
    arr1.set(_arr1,0);

    const _arr2 = [5,6,7,0,0,0,0,0];
    const arr2 = new Uint8Array(_arr2.length);
    arr2.set(_arr2,0);

    const result = calculateUpdatePaths(arr1, arr2);

    assertEquals(result[0][0], _arr2.length - _arr1.length); // position
    assertEquals(result[1], [0,5,6,7]); // update
});

Deno.test("CUP captures decrease in size", () => {
    const _arr1 = [0,0,0,0,0,0];
    const arr1 = new Uint8Array(_arr1.length);
    arr1.set(_arr1,0);

    const _arr2 = [5,6,7,0];
    const arr2 = new Uint8Array(_arr2.length);
    arr2.set(_arr2,0);

    const result = calculateUpdatePaths(arr1, arr2);

    assertEquals(result[0][0], _arr2.length - _arr1.length); // position
    assertEquals(result[1], [0,5,6,7]); // update
});

Deno.test("CUP captures double change", () => {
    const _arr1 = [0,0,0,0,0,0,0,0,0];
    const arr1 = new Uint8Array(_arr1.length);
    arr1.set(_arr1,0);

    const _arr2 = [1,2,3,0,0,4,5,6,0];
    const arr2 = new Uint8Array(_arr2.length);
    arr2.set(_arr2,0);

    const result = calculateUpdatePaths(arr1, arr2);

    assertEquals(result[1], [0,1,2,3]); // update 1
    assertEquals(result[2], [5,4,5,6]); // update 1
});