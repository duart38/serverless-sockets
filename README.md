# The idea
### Bringing serverless functionality and extendability to a websocket server.

# But why??
- Dynamically interchange "plugs" at runtime without any downtime
- no server config modifications required.. just add a function and you're done..
- Multi-threading becomes quite easy
- wrap existing APIs into a websocket interface for legacy codebase
- Serverless because the longer a JS program runs the more markings the v8 makes thus allowing it to make better optimization assumptions

### Why TS and Deno.. specifically why TS in the Deno configuration?
Strongly typed JIT compilers have a crazy overhead.On top of that regular TS in most nodejs configurations obfuscate the code in an inneficient manner.. moral of the story is if you compile with TS in Deno you do not obfuscate the code you just strip away the types.. this allows me (the developer) to restrict shapes in function and allow the V8 engine to more easily optimize code. This, in contract to run-time type checking (which prevents any sort of optimizations from happening), will make this server quite fast.

# Quality of Life options
- [ ] Payload / Performance measuring (inbound, outbound payload sizes, plug execution time..)
- [ ] CLI for generating functions! (e.g: $ ```socket add plug <name>```)


# some experiments
Can we move the "for await (const ev of socket)" to a worker and when an event is received we parse it and decorate it then return it? we might need to re-construct the socket API inside the worker (using rid).
if we succeed with the above, theoretically we will automatically allow shorter socket payloads to enter the
system first.. which might be good if we assume that shorter payloads are for shorter plugs. this will also take the pain away from decorating on the main thread.. which is just brutally slow.


# Deliverables
- [ ] An executable (.exe or a unix executable) to allow "double-click-run"
- [ ] SRS
- [ ] Documentation
- [ ] tests (Unit tests, integration tests)
- [ ] CLI application (install-able as native binary)

# What i will need
- A github repository (i could alo create my own)
- [x] A set of things that this framework MUST do (MVP)
- [x] What "problem" this framework will solve or how it will improve ***X***
- Someone available that i can contact as i go through the process of writing my internship papers (i.e. approval form, mobilityOnline)

# The problem
customer generates operational data and the back-office receives analytical data in real time (and vice versa).

## MVP
- Needs to be realtime (i.e. no refresh).
- When business logic changes, the front-end changes accordingly.
- If permissions is revoked while a given user is viewing / using, this is reflected in the front-end.

## Additional remarks
sockets have a problem with mocking it on the front-end you generally have to wait for a data with a shape you do not know about.
want to be able to mimic a response from server (shaping), this should be conceptually similar to mocking in unit tests.
essentially you want to able to develop the front-end without the back-end ever being there (compile time knowledge).


# Optimizations
JIT compiler optimizing functions to native code.

decoding and encoding on the front end? less server costs..

pre-computed arrays or Map for "hole-prone" arrays.

The optimizer (V8) makes optimistic assumptions from the inline cache but it may fail sometimes so in those cases V8 throws away the optimized code and comes back to the Full compiler to get types again from the ICs. This process is slow and should be avoided by trying not to change the functions once they are optimized.

.. Maybe we can introduce runtime-type safety features to "trick" TurboFan into kicking in earlier?..
Another thing we can do is restrict the shapes of objects to no more than and no less than (typescript partially does this but not at run-time..)... Any validity checks do lower performance on non "hot" declared methods BUT will be compiled to machine code as soon as these become "hot". why? well multiple shapes in the runtime will require the engine to do a linear search for a shape of the matching parameter shape, that shit is slow as fuck.
**.. in short.. define a shape.. stick to that shape.. PROFIT.**

Some sort of monomorphic (as apposed to polymorphic) checker would be very nice (we could technically do this at compile time and make the IDE annoy the living shit out of the developer...). ***AVOID megamorphic***.

We could seek the first few bytes of an incoming bytestream to only get the event tuple then pass down the rest to the function so the developer can decide if it even makes sense to decode the incoming or not.. also byte arrays are faster to check upon due to the lower level APIs that they provide

another advantage of passing in intArrays instead of strings is that the shape of the message is ALWAYS the same.. this means that the V8 profiler will have a much much easier time optimizing anything that the intArray is passed to.

# some commands
```
deno run -A --v8-flags=--trace-deopt,--trace-opt server.ts
deno run -A --v8-flags=--trace-turbo server.ts
deno run -A --v8-flags=--trace-gc server.ts 
deno run -A --v8-flags=--trace-opt,--trace-file-names server.ts  <---- diamonds

// compiling shenanigans
  --parallel-compile-tasks (enable parallel compile tasks)
        type: bool  default: false

// here's some nasty flags XD
  --always-opt (always try to optimize functions)
        type: bool  default: false



deno run -A --v8-flags=--trace-opt,--trace-file-names,--always-opt,--trace-deopt server.ts > v8dump.txt
```

# some links
- https://v8.dev/blog/optimizing-proxies
- https://blog.sessionstack.com/how-javascript-works-event-loop-and-the-rise-of-async-programming-5-ways-to-better-coding-with-2f077c4438b5
- https://blog.sessionstack.com/how-javascript-works-inside-the-v8-engine-5-tips-on-how-to-write-optimized-code-ac089e62b12e
- https://blog.sessionstack.com/how-javascript-works-memory-management-how-to-handle-4-common-memory-leaks-3f28b94cfbec
- https://javascript.info/proxy
- https://v8.dev/features/modules
- https://v8.dev/features/weak-references

# Generators:
why?: https://dev.to/alekseiberezkin/es6-generators-vs-iterators-performance-1p7
they're not 'faster' but closures are great!. it also makes code very easy .. where you see yield is where a value can come out.. multiple yields are allowed in the same scope (contrary to returns which exits the scope after)

# Auto scaling:
We could scale on the same machine by building a manager that spawns and manages new instances of a server that runs the code and pipes back results
on something like an RPC system, this in term calls back to the main responder to shoot back data to the clients. This is a very powerful tool that can be used to scale a server to a large number of clients while allowing for the server to not block when a large request comes in (single core issues).
https://deno.land/x/gentleRpc@v1.1

alternative: https://deno.land/x/async_call_rpc@v4.0.0

- We might need to pre-launch a few instances to not have to deal with the whole having to connect to a server of which might or might not be working.
- we could also have a communication standard that indicates to the main server that a new sub-server has been launched on the same machine. this then means to connect to it and start sending requests to it based on load.

> Data to be moved around instances are to be handled with localStorage or some sort of internal communication on the system (probably not exposed to the outside world).

A problem with the above solution is that when a socket function gets updated we have a few options:
1. we can just update the function and have the server restart ALL ***THE INSTANCES*** and pick up the new function(s). this is slow and has an annoying downtime
2. we can just update the function and have the server restart ONE instance and pick up the new function(s). this is faster but now we need to keep track of which instance has which version of which function.. (confusing)
3. [BETTER] -> have the instances all listen to one folder and update themselves (i.e. they ship with their own event-handler and FS watchers). this makes the newly spawned instances a bit more memory heavy but it allows them to be fully independant of the main server and also allows for a send and forget approach to the main server (i.e. send an event with some data and don't worry about getting data back.. "don't call us we will call you")

> BIG NOTE: don't forget to kill the child instances when the main server is killed (hook on unload or something like that).

Nice to-haves:
1. Would be nice if each spawned instance has a 'timeout' that would kill it if it doesn't get a 'im-done' response within a certain time. this would also trigger a spawn of a new instance.
2. Would also be nice if the spawned instances have a property which indicate how much load they are able to take (how many requests before we divert to a different spawned instance)
3. Balance the percentage load across all instances (i.e. if there are 4 spawned instances we divide by 25,25,25,25 %). this can actually very easily be done by using a circular list.. especially if all the instances have the same functionality.

> if we use RPC we could take advantage of batching and have the main server send a batch of requests to the spawned instances and then wait for the responses.

> ***NOTICE:*** we won't have access to the main sockets with their respective socket connections so we need a way to bi-directionaly send data to provide access to socket-specific api's like sending a message to a DIFFERENT socket or a broadcast or a kick event etc etc.. basically we need to read all the public functions in the Socket class and expose them on a RPC connection or something similar
---

We could also go full on crazy and make all the functions their own server instance and communicate with them somehow. this however has the limitation of possibly spawning a lot of servers and having to deal with all of them.