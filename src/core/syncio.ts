export async function ensureSync<T>(val: T|Promise<T>): Promise<Awaited<T>> {
    if (val instanceof Promise) {
        val = await val;
    }

    return val as Awaited<T>;
}