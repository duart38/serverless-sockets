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

Esentially you 'yield' back values to the client side every time you want to send them an update.
If you're unfamiliar with generator functions take a look at [this page](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*)

# CLI
> Note: Configurations adapted on the command line are only active for the duration of the program. I.E. they will not persist.

This project ships with a command line interface that aims to help you configure the server entirely from the command line.
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

# Configuration
To configure the server see the config.js file within the 'src' folder of this project.
The configuration class in this file should contian all the information and documentation needed.



# Design stuff
![Data_Flow](https://user-images.githubusercontent.com/30909481/142433882-7a72d3ee-6636-4777-87fd-f28e35d31a06.png)

## payload
![payload_shape](https://user-images.githubusercontent.com/30909481/142433939-12eb9f00-3d89-4123-93d1-1d1e4e680ba7.png)

