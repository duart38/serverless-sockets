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

/**
 * Instructions that are used when the user is transferring data via sync.
 */
export enum syncInstruction {
  modify,
  delete,
}
/**
 * The shape of an instruction to modify or delete a portion of the destination data when the user is transferring data via sync.
 */
export interface modificationInstruction {
  path: string[];
  value: unknown;
  ins: syncInstruction;
}
