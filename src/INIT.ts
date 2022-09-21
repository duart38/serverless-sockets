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

import Socket from "./server/Socket.ts";

/**
 * This function is executed right after the socket server is created.
 * Put logic here that is to be executed regardless of any event that is to be executed.
 *
 * EXAMPLE: listen for incoming connection from the socket and send each of them a message.
 */
export function INIT(_socket: Socket) {
  console.log("initial function called");
}
