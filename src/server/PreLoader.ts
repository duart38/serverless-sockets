import { Log } from "../components/Log.ts";

/**
 * Pre-loads files into memory. could speed up initial socket message processing
 * @param folder
 */
export async function preLoadPlugs(folder: string) {
  Log.info(`[+] pre-loading folder: ${folder}`);
  for await (const entry of Deno.readDir(folder)) {
    if (entry.isFile) {
      try {
        await import(`${folder}/${entry.name}`);
      } catch (e) {
        Log.error(`[!] Could not pre-load file : ${folder}/${entry.name}\n${e}`);
      }
    } else preLoadPlugs(`${folder}/${entry.name}`);
  }
}
