const variable = new Uint8Array(50);

// Use the permission flag --allow-hrtime return a precise value.

/**
 * This value needs to be high enough to be able o see the nano second differences due to big O complexity
 */
const TIMES = 500000;

function checkInstance(){
    let temp = 0;
    console.time('checkInstance');
    for(let i = 0; i < TIMES; i++){
        if(variable instanceof Uint8Array){
            temp++ // just to emulate something
        }
    }
    console.timeEnd('checkInstance');
}
function checkConstructor(){
    let temp = 0;
    console.time('checkConstructor');
    for(let i = 0; i < TIMES; i++){
        if(variable.constructor === Uint8Array){
            temp++ // just to emulate something
        }
    }
    console.timeEnd('checkConstructor');
}

checkInstance(); // ~6ms
checkConstructor(); // ~3ms

// conclusion, because we already have the constructor information built and instantiated it is faster to check against it rather than checking against the instance (which would not sample what is already there in memory but attempt to reflect it in the engine)