/**
 * Helper function that ensures that a user-defined function return value is awaited if needed
 *
 * @example
 * // User defined function that might return a promise or directly a value
 * function foo(sendPromise: boolean): Promise<number>|number> {
 *     if (sendPromise) {
 *         return Promise.resolve(123);
 *     }
 *
 *     return 123;
 * }
 *
 * // somewhere in the lib
 * const val: number = await syncio.ensureSync<number>(foo(false));
 * const val2: number = await syncio.ensureSync<number>(foo(true));
 *
 * @param val - The value that should be awaited if needed.
 *
 * @return A promise with the awaited value if it was required
 */
export async function ensureSync<T>(val: T | Promise<T>): Promise<Awaited<T>> {
    if (val instanceof Promise) {
        val = await val;
    }

    return val as Awaited<T>;
}