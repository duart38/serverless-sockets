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

import { U255 } from "../interface/CLAMP.ts";

/**
 * Chunk up a 32-bit value into an array of 8 bit values
 * @param num
 * @returns
 */
export function chunkUp32(num: number): [U255, U255, U255, U255] {
  const parts: [U255, U255, U255, U255] = [0, 0, 0, 0];
  parts[0] = ((num & 0x7F000000) >> 32) as U255;
  parts[1] = ((num & 0x00FF0000) >> 16) as U255;
  parts[2] = ((num & 0x0000FF00) >> 8) as U255;
  parts[3] = (num & 0x000000FF) as U255;
  return parts;
}

/**
 * Chunk up a 16-bit value into an array of 8 bit values
 * @param num
 * @returns
 */
export function chunkUp16(num: number): [U255, U255] {
  const parts: [U255, U255] = [0, 0];
  parts[0] = ((num & 0x0000FF00) >> 8) as U255;
  parts[1] = (num & 0x000000FF) as U255;
  return parts;
}
