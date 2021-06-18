import { CONFIG } from "../config.js";

export function decorateAccessors<T extends Record<string, unknown>>(obj: T, callBack: (val: unknown) => void) {
  if(CONFIG.nestedPayloadProxy){
    Object.entries(obj).forEach(([key, val]) => {
      if (typeof val === "object") {
        (obj[key] as unknown) = decorateAccessors(val as any, callBack);
      }
    });
  }
  return new Proxy(obj, {
    set: (obj, modifiedKey, value)=>{
      Reflect.set(obj, modifiedKey, value);
      callBack(value); // TODO: we could accelerate ignition and turbofan if we ensure the same data shape here (i.e. don't mix numbers with string etc)
      return true;
    }
});
}

export function decorateAccessorsWP<T extends Record<string, unknown>>(obj: T, callBack: (val: unknown, path: string[]) => void, path: string[] = []): T {
	if(CONFIG.nestedPayloadProxy){
	  Object.entries(obj).forEach(([key, val]) => {
		if (typeof val === "object") {
		  (obj[key] as unknown) = decorateAccessorsWP(val as any, callBack, [...path, key]);
		}
	  });
	}
	return new Proxy(obj, {
	  set: (obj, modifiedKey, value)=>{
		Reflect.set(obj, modifiedKey, value);
		callBack(value, [...path, modifiedKey as string]); // TODO: we could accelerate ignition and turbofan if we ensure the same data shape here (i.e. don't mix numbers with string etc)
		return true;
	  }
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
