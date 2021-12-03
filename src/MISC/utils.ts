// import { CONFIG } from "../config.js";

// /**
//  * The shape of the return type of a proxy that can be revoked.
//  */
// export interface revokableProxy<T> {
//   value: T;
//   revoke: (() => void)[];
// }

// export function decorateAccessors<T extends Record<string, unknown>>(
//   obj: T,
//   callBack: (val: unknown) => void
// ) {
//   if (CONFIG.nestedPayloadProxy) {
//     Object.entries(obj).forEach(([key, val]) => {
//       if (typeof val === "object") {
//         // deno-lint-ignore no-explicit-any
//         (obj[key] as unknown) = decorateAccessors(val as any, callBack);
//       }
//     });
//   }
//   return new Proxy(obj, {
//     set: (obj, modifiedKey, value) => {
//       Reflect.set(obj, modifiedKey, value);
//       callBack(value);
//       return true;
//     },
//   });
// }

// /**
//  * Decorate accessors with path support (updates also give path information to form an instruction set)
//  * @param obj
//  * @param callBack
//  * @param path
//  * @returns
//  */
// export function decorateAccessorsWP<T extends Record<string, unknown>>(
//   obj: T,
//   callBack: (val: unknown, path: string[], obj: T) => void,
//   path: string[] = []
// ): revokableProxy<T> {
//   const revokableAcc = [];
//   if (CONFIG.nestedPayloadProxy) {
//     Object.entries(obj).forEach(([key, val]) => {
//       if (typeof val === "object") {
//         // deno-lint-ignore no-explicit-any
//         const sub = decorateAccessorsWP(val as any, callBack, [...path, key]);
//         (obj[key] as unknown) = sub.value;
//         revokableAcc.push(sub.revoke);
//       }
//     });
//   }
//   const { proxy, revoke } = Proxy.revocable(obj, {
//     set: (obj, modifiedKey, value) => {
//       Reflect.set(obj, modifiedKey, value);
//       callBack(value, [...path, modifiedKey as string], obj);
//       return true;
//     },
//   });
//   revokableAcc.push(revoke);
//   return {
//     value: proxy,
//     revoke: revokableAcc,
//   };
// }
