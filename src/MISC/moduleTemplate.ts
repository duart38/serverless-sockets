export function moduleTemplate() {
  return `import { Log, LogLevel } from "../components/Log.ts";
import { SocketMessage } from "../interface/message.ts";
import { ModuleGenerator } from "../interface/socketFunction.ts";

export async function* renameMe(message: SocketMessage, from: number): ModuleGenerator {
    Log.info({level: LogLevel.low, message: \`Message from \${from}, \${message.payload}\`});
    yield { // this is how you return values. you can also use to return keyword to exit early.
        event: "Greet", // you may send back any event to the client side. it is up to them if they want to act upon it or not.
        // type: EventType.BROADCAST, // uncomment this to send a broadcast event instead (sends message to all connected clients excluding the one that initiated)
        payload: { // your can put anything in this one.
            name: \`Hello \${from}, i got your message\`
        }
    }
}

// you may put more methods here to be called when this event is triggered, make sure it follows the same shape as the one above.
`;
}
