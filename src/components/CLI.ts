/*
 *   Copyright (c) 2022 Duart Snel

 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.

 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.

 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

// deno-lint-ignore-file no-explicit-any ban-types

import singleton from "https://raw.githubusercontent.com/grevend/singleton/main/mod.ts";
import { CONFIG, configuration } from "https://raw.githubusercontent.com/duart38/serverless-sockets/main/src/config.js";
import { Args, parse } from "https://deno.land/std@0.158.0/flags/mod.ts";
import { moduleTemplate } from "../MISC/moduleTemplate.ts";

export class CLI {
  /**
   * Contains arguments parsed from the command line
   */
  private args: Args;
  private ready: Promise<configuration | void>;

  /**
   * Command Line Interface (CLI). used to parse command line arguments and set configuration values dynamically.
   * NOTE: use the singleton method to get the CLI instance.
   * NOTE: this instance needs to be run before the application starts as modifying the configuration is single threaded.
   * @see {$CLI}
   * @see {instance}
   */
  constructor() {
    this.args = parse(Deno.args);
    this.ready = new Promise<configuration | void>((res, rej) => {
      if (this.args["h"] !== undefined || this.args["help"] !== undefined) {
        console.log(`\n\n
--generate <name of module> \t\t\t |generates an endpoint module with the name provided, the name is the name of the event|\n\n
Available configurations:`);
        if (Object.keys(this.args).length > 2) {
          delete this.args["h"];
          delete this.args["help"];

          this.printHelp(this.args);
        } else {
          this.printHelp(CONFIG);
        }
        rej();
      } else if (this.args["generate"] && typeof this.args["generate"] === "string") {
        Deno.writeTextFileSync(`${CONFIG.plugsFolder}/${this.args["generate"]}.ts`, moduleTemplate());
      } else {
        this.parseArgs();
        res(CONFIG);
      }
    });
  }

  /**
   * A promise that resolves when the CLI has parsed the flags and updated the configuration.
   * @returns {Promise<void>} resolved when all command line arguments have been parsed and configuration values have been set.
   */
  public onReady(): Promise<configuration | void> {
    return this.ready;
  }

  /**
   * Prints the help text for the CLI. this text includes all the available flags.
   * This method auto-generates the help text based on the configuration options by reading the file.
   * @param config The config file in the form of an object.
   * @param preKey DO NOT USE, this is to support recursive nesting in the object file.
   */
  private async printHelp(config: object, preKey = "") {
    for(const [key, v] of Object.entries(config)){
      if (typeof v === "object") {
        await this.printHelp(v as Record<string, unknown>, preKey + `${key}.`);
      } else {
        console.log("\n-------------------------");
        console.log(`\u001b[31m--${preKey}${key}\u001b[0m \u001b[34m${typeof v}\u001b`);
        console.log(await this.printDoc(`${preKey}${key}`));
      }
    }
  }
  private async printDoc(path: string) {
    if (!path.startsWith("configuration") && path.split(".").length !== 2){
      path = "configuration." + path;
    }
    // if(path.split(".").length === 2) path.replace("configuration.", "")
    const p = Deno.run({
      cmd: ["deno", "doc", "config.js", `${path}`],
      stdout: 'piped'
    });

    const raw_text_out = new TextDecoder().decode((await p.output()));
    return raw_text_out.replaceAll(/((const.+)|Defined.+)(\n|\r|\n\r|\r\n)/gm, "").trim();

  }

  /**
   * Check if 2 types are equal
   * @param a lhs object
   * @param b rhs object
   * @returns true if the types are equal, false otherwise.
   */
  private _checkTypeEquals(a: unknown, b: unknown) {
    return typeof a === typeof b;
  }

  /**
   * Attempts to cast 'value' to the typeof castTo
   */
  private _attemptCast(value: unknown, expected: unknown){
    if(typeof value === typeof expected) return value;
    switch(typeof expected){
      case "boolean": return value === 'true' ? true : false;
      case "number": return Number(value)
      default: return value;
    }
  }

  /**
   * Parses the stored arguments (from the command line) and updates the configuration values.
   */
  private parseArgs() {
    for(const [key, val] of Object.entries(this.args).filter(([k]) => k !== "_")){
      if ((CONFIG as unknown as Record<string, unknown>)[key]) {
        if (this._checkTypeEquals((CONFIG as unknown as Record<string, unknown>)[key], val) === false) {
          console.error(`Supplied argument ${key}'s type (${typeof val}) does not match config values type (${typeof (CONFIG as unknown as Record<string, unknown>)[key]}).`);
        }
        if (typeof (CONFIG as unknown as Record<string, unknown>)[key] === "object") {
          Object.entries(val).forEach(([eK, eV]) => {
            if (this._checkTypeEquals((CONFIG as any)[key][eK], eV) === false) {
              console.error(`Supplied argument ${key}.${eK}'s type (${typeof eV}) does not match config values type (${typeof (CONFIG as any)[key][eK]}).`);
            }
            (CONFIG as any)[key][eK] = this._attemptCast(eV, (CONFIG as any)[key][eK]);
          });
        } else {
          (CONFIG as any)[key] = this._attemptCast(val, (CONFIG as any)[key]);
        }
      } else {
        console.error(`Supplied argument ${key} is not a valid configuration option, run with -h to see available options`);
      }
    }
  }

  /**
   * Helper method to return a singleton instance of the CLI.
   * @returns a CLI instance.
   */
  static instance() {
    return $CLI.getInstance();
  }
}
export const $CLI = singleton(() => new CLI());
