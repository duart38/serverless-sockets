/*
 *   Copyright (c) 2022 Duart Snel

 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.

 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.

 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

export function moduleTemplate() {
  return `import { Log, SocketMessage, ModuleGenerator } from "https://raw.githubusercontent.com/duart38/serverless-sockets/main/src/mod.ts";

export async function* renameMe(message: SocketMessage, from: WebSocket): ModuleGenerator {
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
