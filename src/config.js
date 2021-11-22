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
         * Indicates if broadcast messages (sent to all connected clients) shjould exclude the client that initiated the
         * broadcast event.
         */
        excludeSenderOnBroadcast = false;
    
        /** Indicates wether this server needs to use TLS or not */
        secure = false;
    
        /**
         * Where to store and get dynamic code to be executed
         */
        plugsFolder = "/Users/duartasnel/Local/WORK/BusinessOne/socketstuff/src/plugs";
    
        printLogToConsole = true;
        /**
         * Indicates the verbosity of the logger (what is to be logged) based on the log level.
         * See the LogLevel enum to ensure the propper value here.
         * @see {LogLevel}
         */
        logLevel = 4;
        /**
         * Limit the length of the log buffer.
         * - Any overflow of the log would result in the oldest value being popped from the buffer.
         * - To keep the logSize low and make use of the log one could dump the log as they see fit.
         */
        logSizeLimit = 1;
    
        /**
         * Configuration options for the insecure (HTTP, WS) version of the server.
         */
        INSECURE = {
            /** The port to listen on. */
            port: 8080,
            /** A literal IP address or host name that can be resolved to an IP address.
            * If not specified, defaults to `0.0.0.0`. */
            hostname: "0.0.0.0",
        };

        /**
         * Configuration options for the secure (HTTPS, WSS) version of the server.
         * This version requires the certification and key files to spin up a secure web server.
         */
        TLS = {
            /** The port to listen on. */
            port: 8080,
            /** A literal IP address or host name that can be resolved to an IP address.
            * If not specified, defaults to `0.0.0.0`. */
            hostname: "0.0.0.0",
            /** Server certificate file. */
            certFile: "/Users/duartasnel/Local/WORK/BusinessOne/socket_demos/.cert/cert.pem",
            /** Server public key file. */
            keyFile: "/Users/duartasnel/Local/WORK/BusinessOne/socket_demos/.cert/key.pem",
        };
    
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
        memoryMetrics = {
            /**
             * Turns the memoryMetrics on or off.
             */
            isOn: false,
            /**
             * The interval in which the program should print out heap information.
             */
            interval: 5000
        }
}
/**
 * @type {Record<string, unkown>}
 */
 export const CONFIG =  new configuration();