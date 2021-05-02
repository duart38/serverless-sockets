import { CONFIG } from "../config.js";

function makeDefaultProperty(
  obj: Record<string, unknown>,
  name: string,
  callBack: (val: unknown) => void
) {
  let value = obj[name];
  return Object.defineProperty(obj, name, {
    set: function (val) {
      value = val;
      callBack(value);
    },
    get: function () {
      return value;
    },
  });
}
export function decorateAccessors(
  obj: Record<string, unknown>,
  callBack: (val: unknown) => void
) {
  Object.entries(obj).forEach(([key, val]) => {
    if (typeof val === "object") {
      decorateAccessors(val as any, callBack);
    }
    makeDefaultProperty(obj, key, callBack); // NOTE: obj here needs to be the scope that the key is in..
  });
}

/**
 * @returns true if the payload exceeds the limit set in CONFIG.payloadLimit
 */
export function payloadCeiling(str: string): boolean {
  // {"event":"x","payload":""} <-- baseline shape not included in limit calculation.
  if (str.length > CONFIG.payloadLimit - 26) return true;
  return false;
}
