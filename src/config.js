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
    
        INSECURE = {
            /** The port to listen on. */
            port: 8080,
            /** A literal IP address or host name that can be resolved to an IP address.
            * If not specified, defaults to `0.0.0.0`. */
            hostname: "0.0.0.0",
        };
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
         * Indicates wether incoming payloads should be recursively proxied. if true
         * Proxying the payload will call itself to proxy any nested objects withing the incoming object.
         * Turning this on will have a small perfomance impact on deep nested objects to about O(log2n)
         */
        nestedPayloadProxy = true;
    
        /**
         * Modify the proxies of the incoming object to sync an object in the client-server..
         * This has an initial perfomance impact, i.e. if you send allot of requests to the server this can slow things down a bit.
         * With the above out of the way, if you send one or few requests and expect allot of data back in the client this option
         * can significantly help.
         * @see https://v8.dev/blog/optimizing-proxies
         */
        proxySyncIncomingData = false;
        /**
         * Only applies if proxySyncIncomingData is 'true'
         */
        proxySyncSettings = {
            /**
             * Indicates if we send back instructions on how to update the object instead of sending a duplicate.
             * This can be used when the objects being synced are large, instead of replicating the entire object through the network
             * this option responds with indexes and where to place what item.. Think of this as server side computing where in an object the update(s)
             * need to occur and responding with the instructions to do so.
             */
            instructionReply: true
        };
    
        /**
         * Indicates wether we should validate the modular functions shape. this checks if the parameter count is according to the framework specifications.
         * This does not need to be enabled as it only adds boilerplate code but it DOES improve perfomance by indicating to the v8 engine that this
         * function will always have the same shape (done by enforcing shape thus always having the same shape for code marking to be included in the optmization pipelines)
         */
        validateFunctionShape = false;
        memoryMetrics = {
            isOn: false,
            interval: 5000
        }
}
/**
 * @type {Record<string, unkown>}
 */
 export const CONFIG =  new configuration();