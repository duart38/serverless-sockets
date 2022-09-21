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

// deno-lint-ignore-file

/**
 * If you're here to try and understand what this does.. just dont... dont touch this code. dont breathe on this code.
 * in fact you looking at this code right now will potentially cause it to break.. stop it...
 *
 * ...
 *
 * ...
 *
 * your'e still here arent you?....
 * ...
 * ok fine...
 *
 * here be dragons...
 */

type BuildPowersOf2LengthArrays<N extends number, R extends never[][]> = R[0][N] extends never ? R
  : BuildPowersOf2LengthArrays<N, [[...R[0], ...R[0]], ...R]>;

type ConcatLargestUntilDone<N extends number, R extends never[][], B extends never[]> = B["length"] extends N ? B
  : [...R[0], ...B][N] extends never ? ConcatLargestUntilDone<N, R extends [R[0], ...infer U] ? U extends never[][] ? U : never : never, B>
  : ConcatLargestUntilDone<N, R extends [R[0], ...infer U] ? U extends never[][] ? U : never : never, [...R[0], ...B]>;

type Replace<R extends any[], T> = { [K in keyof R]: T };

type TupleOf<T, N extends number> = number extends N ? T[] : {
  [K in N]: BuildPowersOf2LengthArrays<K, [[never]]> extends infer U ? U extends never[][] ? Replace<ConcatLargestUntilDone<K, U, []>, T> : never
    : never;
}[N];

type RangeOf<N extends number> = Partial<TupleOf<unknown, N>>["length"];
export type U255 = RangeOf<256>;

/**
 * Dont ask...
 */
