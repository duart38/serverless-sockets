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

export class INSECURE {
    /** The port to listen on. */
    port = 8080;
    /** 
     * A literal IP address or host name that can be resolved to an IP address.
     * If not specified, defaults to `0.0.0.0`. 
     **/
    hostname = "0.0.0.0";
}

export class memoryMetrics {
  /**
   * Turns the memoryMetrics on or off.
   */
   isOn = false;
   /**
    * The interval in which the program should print out heap information.
    */
   interval = 5000;
}

export class TLS {
    /** The port to listen on. */
    port = 8080;
    /** A literal IP address or host name that can be resolved to an IP address.
     * If not specified, defaults to `0.0.0.0`. */
    hostname = "0.0.0.0";
    /** Server certificate file. */
    certFile = "./cert.pem";
    /** Server public key file. */
    keyFile = "./key.pem";
}

/**
 * configuration object
 */
export class configuration {
  /**
   * Limits the allowed payload size. skips further operations if the incoming size is greater.
   */
  payloadLimit = 250000;
  /**
   * If this is enabled the initial start of the server will load in all the socket functions.
   * This will cache them resulting in the first request from a user being faster
   */
  preloadPlugs = true;
  /**
   * Indicates if broadcast messages (sent to all connected clients) should exclude the client that initiated the
   * broadcast event.
   */
  excludeSenderOnBroadcast = true;

  /** Indicates wether this server needs to use TLS or not */
  secure = false;

  /**
   * Where to store and get dynamic code to be executed
   */
  plugsFolder = "./plugs";

  printLogToConsole = true;
  /**
   * Indicates the verbosity of the logger (what is to be logged) based on the log level.
   * See the LogLevel enum to ensure the propper value here.
   * > NOTE: keeping this low (e.g. 0) slightly improves performance.
   * @see {LogLevel}
   */
  logLevel = 0;
  /**
   * Limit the length of the log buffer.
   * - Any overflow of the log would result in the oldest value being popped from the buffer.
   * - To keep the logSize low and make use of the log one could dump the log as they see fit.
   */
  logSizeLimit = 1;

  /**
   * Configuration options for the insecure (HTTP, WS) version of the server.
   */
  INSECURE = new INSECURE()

  /**
   * Configuration options for the secure (HTTPS, WSS) version of the server.
   * This version requires the certification and key files to spin up a secure web server.
   */
  TLS = new TLS()

  /**
   * Indicates wether we should validate the modular functions shape. this checks if the parameter count is according to the framework specifications.
   * This does not need to be enabled as it only adds boilerplate code but it DOES improve perfomance by indicating to the v8 engine that this
   * function will always have the same shape (done by enforcing shape thus always having the same shape for code marking to be included in the optmization pipelines)
   */
  validateFunctionShape = false;
  /**
   * Includes options to turn on and adapt memory metric printouts in the console.
   * This can be used to view things like the external and internal heap size. (I.E. how much memory we're using)
   */
  memoryMetrics = new memoryMetrics()
}

export const CONFIG = new configuration();
