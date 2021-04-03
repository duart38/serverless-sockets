export default class NonBlocking{
    public static call<T>(func: any, ...args: unknown[]){
        setTimeout(function(...passed){passed[0](...passed.slice(1))},0, func, ...args)
    }
}