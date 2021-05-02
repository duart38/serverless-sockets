# The idea
### Bringing serverless functionality and extendability to a websocket server.

# But why??
- Dynamically interchange "plugs" at runtime without any downtime
- no server config modifications required.. just add a function and you're done..
- Multi-threading becomes quite easy
- wrap existing APIs into a websocket interface for legacy codebase

# Quality of Life options
- [ ] Payload / Performance measuring (inbound, outbound payload sizes, plug execution time..)
- [ ] CLI for generating functions! (e.g: $ ```socket add plug <name>```)

# extra TODO(s):
- [ ] Write tests
- [ ] More modular approach to the EventHandler (i.e. allow non dynamic, compile time function interpretation)
- [ ] Error logging module (threaded, should take load away from printing to the console)
- [ ] Lifecycle hooks for plugs ??? -> (e.g. beforeSend(), afterSend() )
- [ ] C# to web-assembly to this framework ***???*** (should be supported but i have not tested this)
- [ ] CORS!!!
- [ ] Loading plugs from the network!.  (currently it is possible via an import st combined with a call or instantiation)
- [ ] Add pre-compiler to remove the initial slow call?
- [ ] We could also compile/bundle on change, store in different directory, and then have the handler pick from the bundles (space/time tradeoff here as the FS will grow with all the self-contained JS modules in each bundled file... definitely faster tho..)
- [ ] we need to build a front-end websocket wrapper that filters out events based on our messageEvent payload.. also an addition would be to listen for changes inside our accessor decorator and call the "set" method when the server responds.. this will introduce a shaping for the front-end
- [ ] Caching is NOT part of the websocket spec. so while ws has less overhead than HTTP we need some form of caching.
- [x] Support sub directories in plugs to allow some structure to devs
- [ ] SIMD can be very competitive -> https://github.com/luizperes/simdjson_nodejs

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