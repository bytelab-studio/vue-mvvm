import * as syncio from "@/syncio";

export enum DelegateMode {
    PARALLEL,
    SEQUENTIAL
}

export type DelegateCallback<Arguments extends any[]> = (...args: Arguments) => void | Promise<void>;

export type DelegateRevoke = () => void;

export class Delegate<const Arguments extends any[] = []> {
    private readonly mode: DelegateMode;
    private subscribers: DelegateCallback<Arguments>[];

    public constructor(mode: DelegateMode = DelegateMode.SEQUENTIAL) {
        this.mode = mode;
        this.subscribers = [];
    }

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

    public invoke(...args: Arguments): Promise<void> {
        switch (this.mode) {
            case DelegateMode.PARALLEL:
                return this.processParallel(args);
            case DelegateMode.SEQUENTIAL:
                return this.processSequential(args);
        }
    }

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