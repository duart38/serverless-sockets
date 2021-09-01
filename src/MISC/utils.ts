import { CONFIG } from "../config.js";

export interface revokableProxy<T> {
  value: T,
  revoke: (()=>void)[]
}

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

/**
 * Decorate accessors with path support (updates also give path information to form an instruction set)
 * @param obj 
 * @param callBack 
 * @param path 
 * @returns 
 */
export function decorateAccessorsWP<T extends Record<string, unknown>>(obj: T, callBack: (val: unknown, path: string[], obj: T) => void, path: string[] = []): revokableProxy<T> {
  let revokableAcc = [];
	if(CONFIG.nestedPayloadProxy){
	  Object.entries(obj).forEach(([key, val]) => {
		if (typeof val === "object") {
      let sub = decorateAccessorsWP(val as any, callBack, [...path, key]);
		  (obj[key] as unknown) = sub.value;
      revokableAcc.push(sub.revoke);
		}
	  });
	}
  const {proxy, revoke} = Proxy.revocable(obj, {
	  set: (obj, modifiedKey, value)=>{
		Reflect.set(obj, modifiedKey, value);
		callBack(value, [...path, modifiedKey as string], obj); // TODO: we could accelerate ignition and turbofan if we ensure the same data shape here (i.e. don't mix numbers with string etc)
		return true;
	  }
  });
  revokableAcc.push(revoke);
  return {
    value: proxy,
    revoke: revokableAcc
  }
}

/**
 * @returns true if the payload exceeds the limit set in CONFIG.payloadLimit
 */
export function payloadCeiling(str: string): boolean {
  // {"event":"x","payload":""} <-- baseline shape not included in limit calculation.
  if (str.length > CONFIG.payloadLimit - 26) return true;
  return false;
}
