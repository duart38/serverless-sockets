export default class NonBlocking{
    public static call(func: (...x:unknown[])=>unknown, ...args: unknown[]){
        setTimeout(function(...passed){passed[0](...passed.slice(1))},0, func, ...args)
    }
}