/**
 * A WeakArray is a collection of objects that maintains weak references
 * to its items, enabling garbage collection of objects when there are no
 * other strong references. Items stored in the WeakArray are not
 * guaranteed to persist and may be removed if they are garbage collected.
 *
 * The class implements the Iterable interface to allow iteration over
 * the non-collected items.
 *
 * @template T The type of objects that the WeakArray will store. Must
 * extend `object`.
 */
export class WeakArray<T extends object> implements Iterable<T> {
    private refs: WeakRef<T>[] = [];

    /**
     * Retrieves the current number of references that points to a non-collected item
     *
     * @return The total count of references that points to a non-collected item
     */
    public get size(): number {
        this.cleanup();
        return this.refs.length;
    }

    /**
     * Adds an item to the collection by wrapping it in a WeakRef and storing it.
     *
     * @param item - The item to be added to the collection.
     */
    public push(item: T): void {
        this.refs.push(new WeakRef(item));
    }

    /**
     * Applies a transformation function to each element in the collection and returns a new array containing the results.
     *
     * @param cb - A callback function that is invoked for each element in the collection. It receives two arguments: the current element and its index.
     *
     * @return A new array containing the results of applying the callback function to each element in the collection.
     */
    public map<TOut>(cb: (item: T, index: number) => TOut): TOut[] {
        let i: number = 0;
        const result: TOut[] = [];

        for (let item of this) {
            result.push(cb(item, i++));
        }

        return result;
    }

    /**
     * Filters the elements of the collection based on the provided callback function.
     *
     * @param cb - A callback function that determines whether each element should be included in the result. The function is passed two arguments: the element and its index in the collection.
     *
     * @return An array containing the elements for which the callback function returned true.
     */
    public filter(cb: (item: T, index: number) => boolean): T[] {
        let i: number = 0;
        const result: T[] = [];

        for (let item of this) {
            if (cb(item, i++)) {
                result.push(item);
            }
        }

        return result;
    }

    public* [Symbol.iterator](): IterableIterator<T> {
        if (this.refs.length === 0) return;
        let needsCleanup: boolean = false;
        for (const ref of this.refs) {
            const value: T | undefined = ref.deref();
            if (typeof value != "undefined") {
                yield value;
            } else {
                needsCleanup = true;
            }
        }
        if (needsCleanup) {
            this.cleanup();
        }
    }

    private cleanup(): void {
        if (this.refs.length == 0) return;
        this.refs = this.refs.filter(ref => typeof ref.deref() != "undefined");
    }
}
