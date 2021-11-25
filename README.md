# The idea
Bringing serverless functionality and extendability to a websocket server.
## But why??
- Dynamically interchange "modules" at runtime without any downtime
- no server config modifications required.. just add a function and you're done..
- Hide the messy webscoket implementation and work with easy functions
- wrap existing APIs into a websocket interface for legacy codebases (familiar interface)


# Running locally
Requirements: [Deno](https://deno.land)

1. clone the repo and go into the folder
2. go into the src folder

```
deno run -A mod.ts
```

🎉

# How it works
Depending on your configuration your only concern (as a developer) will be the 'plugs' folder (folder name depends on the config).
The default folder obtained with the cloning of this repository contains some example code in the 'plugs' folder.
Here's an example of how the modular functions look like.
## Simple return message(s)
```TypeScript
export async function* test(message: SocketMessage, _from: number): ModuleGenerator { // _from is the id of the client
    for(let i = 0; i<message.payload.count; i++){ // message.payload.count is what the client sends us
      yield { // returning data back to the client
        event: "spam-mode",
        payload: {
          name: `iteration ${i}`
        }
      }
    }
}
```
> This returns the yielded object to the client.

Esentially you 'yield' back values to the client side every time you want to send them an update.
If you're unfamiliar with generator functions take a look at [this page](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*)

## Broadcasting message to everyone
To broadcast a message to everyone you can either add ```type: EventType.BROADCAST,``` to your **yield**s or you can use the staticly exposed **broadcast()** method from the Socket class.
> NOTE: it is recommended to use the type property as it hides the implementation details and also prevents memory leaks.
#### yielding a broadcast (Recommended)
```TypeScript
export async function* broadcast(message: SocketMessage, _from: number): ModuleGenerator {
  yield {
    type: EventType.BROADCAST, // instruction to broadcast this message
    event: "broadcast-1",
    payload: message.payload
  }
}
```

#### method-based broadcast (avoid if possible)
```TypeScript
export async function* broadcast(message: SocketMessage, _from: number): ModuleGenerator {
  Socket.broadcast({
      type: EventType.BROADCAST,
      event: "broadcast-1",
      payload: message.payload
    }, _from
  );
  yield {event: '', payload: {}};
}
```
> The reason this method is still available is because yielding does not work in certain scopes (I.E. inner lambdas and or functions).


## Sending to specific client
```TypeScript
Socket.sendMessage(/*client ID*/5, {event: "ev", payload: {}});
```


# CLI
> Note: Configurations adapted on the command line are only active for the duration of the program. I.E. they will not persist.

This project ships with a command line interface that aims to help you configure the server entirely from the command line.
## Inline configuration (will not persist)
To change configuration items:
```sh
deno run -A mod.ts --payloadLimit 10 --INSECURE.port 6969
```

The CLI is also capable of printing out all the configuration options by running: 
```sh
deno run -A mod.ts -h
```

or if you want to read up the documentation of a specific item:
```sh
deno run -A mod.ts -h --payloadLimit
```

## Generating modules
The CLI is able to generate modules:
```sh
deno run -A mod.ts --generate <name_of_event>
```
> name_of_event here is the file name but also the name of the event that is to be called for on the client side to trigger the module.


# Configuration
To configure the server see the config.js file within the 'src' folder of this project.
The configuration class in this file should contian all the information and documentation needed.



## payload
![payload_shape-2](https://user-images.githubusercontent.com/30909481/143445150-e1c3ad2e-bb3f-4392-8984-c46dee58a23a.png)

# Testing
```sh
deno test -A --unstable --coverage=cov_profile && deno coverage cov_profile
```

