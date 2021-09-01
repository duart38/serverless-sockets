export default class ProxyManager {
    private proxies: Map<number, (()=>void)[]>;
    constructor(){
        this.proxies = new Map();
    }

    revokeAll(){
        this.proxies.forEach(t=>t.forEach(x=>x()));
    }

    revokeAllFrom(id: number){
        this.proxies.get(id)?.forEach(x=>x());
    }

    add(id: number, ...proxy: (()=>void)[]){
        this.proxies.get(id)?.push(...proxy);
    }
}