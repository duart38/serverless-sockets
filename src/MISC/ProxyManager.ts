/**
 * @deprecated Proxies are currently not being used.
 */
export default class ProxyManager {
    private proxies: Map<number, (()=>void)[]>;

    /**
     * The proxy manager class helps with storing generated proxies into a location that cam then be revoked easily.
     * This class is to be used to prevent floating references and causing a buffer overflow.
     * @deprecated Proxies are currently not being used.
     */
    constructor(){
        this.proxies = new Map();
    }

    /**
     * Revokes all the proxies registered with this instance.
     */
    revokeAll(){
        this.proxies.forEach(t=>t.forEach(x=>x()));
    }

    /**
     * Revokes all the proxies registered with the given id.
     */
    revokeAllFrom(id: number){
        this.proxies.get(id)?.forEach(x=>x());
    }

    /**
     * Adds a proxy to the given id.
     */
    add(id: number, ...proxy: (()=>void)[]){
        this.proxies.get(id)?.push(...proxy);
    }
}