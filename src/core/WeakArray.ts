export class WeakArray<T extends object> implements Iterable<T> {
    private refs: WeakRef<T>[] = [];

    public push(item: T): void {
        this.refs.push(new WeakRef(item));
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

    public map<TOut>(cb: (item: T, index: number) => TOut): TOut[] {
        let i: number = 0;
        const result: TOut[] = [];

        for (let item of this) {
            result.push(cb(item, i++));
        }

        return result;
    }

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

    public cleanup(): void {
        if (this.refs.length == 0) return;
        this.refs = this.refs.filter(ref => typeof ref.deref() != "undefined");
    }

    public get size(): number {
        this.cleanup();
        return this.refs.length;
    }
}
