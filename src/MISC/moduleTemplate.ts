export function moduleTemplate() {
  return `import { Log, SocketMessage, ModuleGenerator } from "https://raw.githubusercontent.com/duart38/serverless-sockets/main/src/mod.ts";

export async function* renameMe(message: SocketMessage, from: number): ModuleGenerator {
    Log.info(\`Message from \${from}, \${message.payload}\`);
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
