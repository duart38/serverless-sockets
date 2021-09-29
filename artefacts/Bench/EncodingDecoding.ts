import { SocketMessage, yieldedSocketMessage } from "../../src/interface/message.ts";

const RUN_TIMES = 50000;

const message: yieldedSocketMessage = {
    event: "testing",
    payload: {
        name: "John Doe",
        age: 42,
        departments: [1,2,3,4,5,6,7,8,9,0,11,22,33,44,55,66,77,88,99,111,222,333,444,555,666,777,888,999,111111],
        children: [
            {
                name: "Carl Doe",
                age: 12
            },
            {
                name: "Lars Doe",
                age: 10
            }
        ],
        bigString: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut convallis leo tortor, at euismod risus consequat id. Suspendisse semper ipsum eget auctor imperdiet. Cras quis ipsum eget libero tristique rhoncus in pharetra ipsum. Integer eu porttitor sapien, sed facilisis mi. Donec sed maximus lorem. Vivamus vitae lorem eget lacus iaculis pretium. Praesent euismod mauris sed tortor rutrum, sit amet luctus dui finibus. Donec neque felis, molestie in fringilla sed, mattis eget ligula. Nam sed porttitor tortor. In ut maximus ipsum.

        Nullam sit amet iaculis dui. Donec gravida porta metus nec scelerisque. Fusce semper euismod mauris, ut consequat arcu faucibus eu. Duis suscipit quam ac justo mattis, vitae pulvinar libero sagittis. Pellentesque ac libero vel neque eleifend venenatis. Aliquam cursus interdum enim, vitae consectetur orci consectetur quis. Proin a libero tincidunt, porttitor tellus hendrerit, maximus mi. Maecenas varius laoreet augue at posuere. Vestibulum vel turpis id arcu mattis rutrum at quis orci. Nullam lacinia nunc enim, commodo venenatis diam ornare nec. Curabitur eget pretium arcu.
        
        Cras vel hendrerit libero. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Phasellus at ante eu odio eleifend vestibulum non eget tortor. Praesent varius sodales sapien, non dignissim risus sollicitudin a. Mauris semper interdum purus a egestas. Etiam turpis magna, congue vel ligula ut, vulputate tincidunt leo. Etiam elementum nisi tristique neque egestas fermentum. Nulla facilisi. Duis non dui mi. Mauris vel lobortis velit.
        
        Quisque semper lorem at est faucibus facilisis. Praesent luctus posuere mauris sed consequat. Cras at ligula risus. Etiam erat massa, dapibus nec magna non, commodo consectetur metus. Aenean commodo nisi libero, id congue ligula aliquam at. Curabitur pulvinar, dolor nec commodo feugiat, dolor tellus auctor eros, id vestibulum ligula ligula et elit. Vestibulum fermentum odio nec magna pretium, vel efficitur leo dapibus. Cras mattis vitae augue in posuere. Integer tempor sollicitudin massa. Suspendisse maximus magna eget faucibus faucibus. Fusce porttitor pretium nunc, in blandit diam condimentum in. Integer egestas nulla eget justo condimentum pharetra.
        
        Sed scelerisque orci non nunc tempus, vitae volutpat enim condimentum. Cras et iaculis lacus. Curabitur dui nulla, efficitur eu imperdiet sed, convallis sed nibh. Ut at sodales ipsum. Sed pharetra lectus et libero tincidunt condimentum. Duis ut lacus vel leo consequat venenatis sit amet vitae massa. Suspendisse consectetur interdum lacus. Sed at libero eu lacus volutpat porta. Proin sodales neque magna, vel mattis ligula accumsan vel. Sed metus eros, tristique ut ultricies at, facilisis eget nunc. Maecenas eu leo risus. Integer congue urna felis. Quisque scelerisque ipsum ac est aliquam molestie.`
    }
}

function ourMethod(){
    console.time('ourMethod_encode_decode');
    for(let i = 0; i < RUN_TIMES; i++){
        SocketMessage.fromRaw(SocketMessage.encode(message));
    }
    console.timeEnd('ourMethod_encode_decode');
}

function builtInMethod(){
    console.time('builtInMethod_encode_decode');
    for(let i = 0; i < RUN_TIMES; i++){
        const enc = new TextEncoder().encode(JSON.stringify(message));
        JSON.parse(new TextDecoder().decode(enc));
    }
    console.timeEnd('builtInMethod_encode_decode');

}

builtInMethod();
ourMethod();

console.log(`size of our method: ${SocketMessage.encode(message).byteLength} bytes`);
console.log(`size of the default (built in) method: ${new TextEncoder().encode(JSON.stringify(message)).byteLength} bytes`)

/**
    RUN_TIMES = 50000;
    ---
    # Last run stats:

    # builtInMethod_encode_decode: 1555ms
    # ourMethod_encode_decode: 795ms

    > size of our method: 3148 bytes
    > size of the default (built in) method: 3166 bytes

    Our method is significantly faster due to lazy parsing of the event and payload sections.
    Our method is also slightly smaller due to the removal of overhead related to the event string and the encapsulation of everything inside a strinigied json format.
 */