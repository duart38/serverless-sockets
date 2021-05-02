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

    /** Indicates wether this server needs to load from TLS or not */
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
    }
})