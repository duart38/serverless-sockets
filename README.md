# The idea
### Bringing serverless functionality and extendability to a websocket server.

# But why??
- Dynamically interchange "plugs" at runtime without any downtime
- no server config modifications required.. just add a function and you're done..
- Multi-threading becomes quite easy
- wrap existing APIs into a websocket interface for legacy codebase

# Quality of Life options
- Payload / Performance measuring (inbound, outbound payload sizes, plug execution time..)
- CLI for generating functions! (e.g: $ ```socket add plug <name>```)

# extra TODO(s):
- Write tests
- More modular approach to the EventHandler (i.e. allow non dynamic, compile time function interpretation)
- Error logging module (threaded, should take load away from printing to the console)
- Lifecycle hooks for plugs ??? -> (e.g. beforeSend(), afterSend() )
- C# to web-assembly to this framework ***???*** (should be supported but i have not tested this)

# Deliverables
- An executable (.exe or a unix executable) to allow "double-click-run"
- SRS
- Documentation
- tests
- CLI application (install-able as native binary)

# What i will need
- A github repository (i could alo create my own)
- A set of things that this framework MUST do (MVP)
- What "problem" this framework will solve or how it will improve ***X***
- Someone available that i can contact as i go through the process of writing my internship papers (i.e. approval form, mobilityOnline)