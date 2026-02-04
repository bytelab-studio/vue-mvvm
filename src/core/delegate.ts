import * as syncio from "@/syncio";

/**
 * Enum representing the modes of delegation.
 *
 * DelegateMode provides the following modes:
 * - PARALLEL: Represents a mode where actions are executed concurrently.
 * - SEQUENTIAL: Represents a mode where actions are executed in a defined order, one after the other.
 */
export enum DelegateMode {
    PARALLEL,
    SEQUENTIAL
}

/**
 * Represents a callback function that can handle arguments of a specific type
 * and optionally return a Promise for asynchronous execution.
 */
export type DelegateCallback<Arguments extends any[]> = (...args: Arguments) => void | Promise<void>;

/**
 * Represents a function type used to revoke a delegation.
 *
 * This function, when called, performs the necessary revocation actions
 * for a previously established delegated operation.
 */
export type DelegateRevoke = () => void;

/**
 * Represents a delegate mechanism for subscribing and invoking callback functions.
 *
 * Supports sequential and parallel modes for invoking the callbacks.
 */
export class Delegate<const Arguments extends any[] = []> {
    private readonly mode: DelegateMode;
    private subscribers: DelegateCallback<Arguments>[];

    public constructor(mode: DelegateMode = DelegateMode.SEQUENTIAL) {
        this.mode = mode;
        this.subscribers = [];
    }

    /**
     * Subscribes a callback function to the delegate, allowing it to be invoked when the delegate is executed.
     *
     * @param  cb - The callback function to be subscribed to the delegate.
     * @return A function that, when called, revokes the subscription of the callback.
     */
    public subscribe(cb: DelegateCallback<Arguments>): DelegateRevoke {
        this.subscribers.push(cb);
        let revoked: boolean = false;
        return () => {
            if (revoked) {
                return;
            }

            this.subscribers = this.subscribers.filter(x => x != cb)
            revoked = true;
        };
    }

    /**
     * Invokes the appropriate processing method based on the current mode.
     *
     * @param args - The arguments to be passed to the registered callbacks.
     */
    public invoke(...args: Arguments): Promise<void> {
        switch (this.mode) {
            case DelegateMode.PARALLEL:
                return this.processParallel(args);
            case DelegateMode.SEQUENTIAL:
                return this.processSequential(args);
        }
    }

    /**
     * Resets the internal state of the object.
     *
     * This method is typically called in a unmounted hook to remove all unreachable subscribers.
     */
    public dispose(): void {
        this.subscribers = [];
    }

    private async processParallel(args: Arguments): Promise<void> {
        await Promise.allSettled(
            this.subscribers.map(subscriber => syncio.ensureSync(subscriber(...args)))
        );
    }

    private async processSequential(args: Arguments): Promise<void> {
        for (const subscriber of this.subscribers) {
            await syncio.ensureSync(subscriber(...args));
        }
    }
}