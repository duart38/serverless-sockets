# TOC
- [The idea](#the-idea)
  * [But why??](#but-why--)
- [Installing](#installing)
- [Running locally](#running-locally)
- [How it works](#how-it-works)
  * [Simple return message(s)](#simple-return-message-s-)
  * [Broadcasting message to everyone](#broadcasting-message-to-everyone)
      - [yielding a broadcast (Recommended)](#yielding-a-broadcast--recommended-)
      - [method-based broadcast (avoid if possible)](#method-based-broadcast--avoid-if-possible-)
  * [Sending to specific client](#sending-to-specific-client)
  * [Synchronizing big objects with clients](#synchronizing-big-objects-with-clients)
  * [The eventType](#the-eventtype)
- [CLI](#cli)
  * [Inline configuration (will not persist)](#inline-configuration--will-not-persist-)
  * [Generating modules](#generating-modules)
- [Configuration](#configuration)
- [Payload shape](#payload-shape)
- [SYNC payload shape](#sync-payload-shape)
- [Testing](#testing)
- [Considerations and limitations](#considerations-and-limitations)

<small><i><a href='http://ecotrust-canada.github.io/markdown-toc/'>Table of contents generated with markdown-toc</a></i></small>



# The idea
Bringing serverless functionality and extendability to a websocket server.
## But why??
- Dynamically interchange "modules" at runtime without any downtime
- no server config modifications required.. just add a function and you're done..
- Hide the messy webscoket implementation and work with easy functions
- wrap existing APIs into a websocket interface for legacy codebases (familiar interface)
- Reduce websocket abuse (e.g. sending very large objects) by allowing for clever synchronization methods.

# Installing
Requirements: [Deno](https://deno.land)

To install run the command:
```bash
deno install -A -f -n ssocket https://raw.githubusercontent.com/duart38/serverless-sockets/main/src/mod.ts
```

After this you can use the server in any folder with the command:
```bash
ssocket
```
> The server expects a folder called "plugs" to be present in the current directory.

it's also possible to pre-configure the server before installing it to make sure the configurations persist every time the command is run.
To do this use the command to install and prepend the configuration flags to the command:
```bash
deno install -A -f -n ssocket https://raw.githubusercontent.com/duart38/serverless-sockets/main/src/mod.ts <flags-goes-here>
```

> See configuration documentation (CLI) on how to configure the server.


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
        event: "spam-mode", // this is optional. will default to the event name of this module
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

## Synchronizing big objects with clients
> NOTE: this method is only recommended if you have big objects that need to be synchronized between the server and the client!!. it also requires some extra logic on the client-side to make sure everything is in sync.

Oftentimes we tend to abuse the websocket protocol by sending really big objects with small changed to the client to keep things in sync.. this is .. well... bad.

To mitigate this the framework offers a method to synchronize big objects with the client by sending only the required instructions to the client which will then update it's local object.

To use this method you simply need to add ```type: EventType.SYNC,``` to your **yield**s.
example: 
```TypeScript
export async function* sync(message: SocketMessage, _from: number): ModuleGenerator {
  yield {
    type: EventType.SYNC,
    event: "sync-1",
    payload: {} // some big message here
  }
}
```


## The eventType
```TypeScript
/**
 * Global events that the socket server can send back to clients. depending on the value the client is to respond differently
 */
export enum EventType {
  /**
   * a regular message. oftentimes a reply to whoever sent the last message.
   */
  MESSAGE,
  /**
   * A broadcast event is sent to all clients.3
   */
  BROADCAST,
  /**
   * Reserved for authentication, cleans up code a bit.
   */
  AUTH,
  /**
   * Reserved for unknown errors
   */
  ERROR,
  /**
   * Sent back when the event was not found
   */
  NOT_FOUND,

  /**
   * Custom message, developers are free to do what they please here
   */
  CUSTOM_1,
  /**
   * Custom message, developers are free to do what they please here
   */
  CUSTOM_2,
  /**
   * Custom message, developers are free to do what they please here
   */
  CUSTOM_3,
  /**
   * Custom message, developers are free to do what they please here
   */
  CUSTOM_4,
  /**
   * Custom message, developers are free to do what they please here
   */
  CUSTOM_5,
}
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



# Payload shape
> This section is only needed if you are modifying the framework.

This is how a message is encoded when the client communicates with the server and vice versa.
![payload_shape-2](https://user-images.githubusercontent.com/30909481/143445150-e1c3ad2e-bb3f-4392-8984-c46dee58a23a.png)

# SYNC payload shape
> This section is only needed if you are modifying the framework.

The payload shape for the SYNC event will return the difference between the last sent or received object in the form of a multi-dimensional array.

```TypeScript
[
  [number], // the difference between the 2 known arrays, will be negative if the size decreases and positive otherwise
  [indexToStart, number, number, ...], // subsequent arrays start with the index of where to start placing each item and this is then followed by all the items to be placed.
  ...
  ...
]
```

The
```TypeScript
SocketMessage.syncIncoming(msg: Uint8Array)
```
message  will take in a SYNC style payload and synchronize the already existing object with the new one.

Here's how this all looks:

![sync_payload_shape](https://github.com/duart38/serverless-sockets/blob/main/artefacts/Architecture/SYNC_payload.jpg)

![SYNC_payload_example](https://user-images.githubusercontent.com/30909481/145262574-8a171c28-0f1d-4002-a966-152656c4904e.jpg)



# Testing
```sh
deno test -A --unstable --coverage=cov_profile && deno coverage cov_profile
```

# Considerations and limitations
When developing modules keep in mind that the idea of the module is for it to be spawned, to yield it's messages and then to be cleaned up aftwerwards.
This means that you need to be careful when creating any floating references in the method that would prevent it from being cleaned up. 
These are things like refering to an object somewhere else that is never cleaned up (I.E. always in use by something else) or an interval timer.

> Modules that are not cleaned up will continue to exist and for each client that calls the module (via it's event string) a new instance of that module is spawned and is also kept in memory indefinitely thus causing a memory leak.



