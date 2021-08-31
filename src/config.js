export const CONFIG = Object.freeze({
    /**
     * Limits the allowed payload size. skips further operations if the incoming size is greater.
     */
    payloadLimit: 150,
    /**
     * If this is enabled the initial start of the server will load in all the socket functions.
     * This will cache them resulting in the first request from a user being faster
     */
    preloadPlugs: false,

    /** Indicates wether this server needs to use TLS or not */
    secure: false,

    plugsFolder: "./plugs",

    INSECURE: {
        /** The port to listen on. */
        port: Number(Deno.args[0]) || 8080,
        /** A literal IP address or host name that can be resolved to an IP address.
        * If not specified, defaults to `0.0.0.0`. */
        hostname: "0.0.0.0",
    },
    TLS: {
        /** The port to listen on. */
        port: Number(Deno.args[0]) || 8080,
        /** A literal IP address or host name that can be resolved to an IP address.
        * If not specified, defaults to `0.0.0.0`. */
        hostname: "0.0.0.0",
        /** Server certificate file. */
        certFile: "",
        /** Server public key file. */
        keyFile: "",
    },
    /**
     * Indicates wether incoming payloads should be recursively proxied. if true
     * Proxying the payload will call itself to proxy any nested objects withing the incoming object.
     * Turning this on will have a small perfomance impact on deep nested objects to about O(log2n)
     */
    nestedPayloadProxy: true,

    /**
     * Modify the proxies of the incoming object to sync an object in the client-server..
     * This has an initial perfomance impact, i.e. if you send allot of requests to the server this can slow things down a bit.
     * With the above out of the way, if you send one or few requests and expect allot of data back in the client this option
     * can significantly help.
     * @see https://v8.dev/blog/optimizing-proxies
     */
    proxySyncIncomingData: true,
    /**
     * Only applies if proxySyncIncomingData is 'true'
     */
    proxySyncSettings: {
        /**
         * Indicates if we send back instructions on how to update the object instead of sending a duplicate.
         * This can be used when the objects being synced are large, instead of replicating the entire object through the network
         * this option responds with indexes and where to place what item.. Think of this as server side computing where in an object the update(s)
         * need to occur and responding with the instructions to do so.
         */
        instructionReply: true
    }


})