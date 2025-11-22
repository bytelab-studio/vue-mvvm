import {type Component} from "vue";
import * as syncio from "@/syncio";
import {type ReadableGlobalContext, useGlobalContext} from "@hook/useGlobalContext";
import {Action, ActionContext} from "@/Action";

export type ViewModelConstructor<Instance extends ViewModel = ViewModel, Arguments extends [...unknown[]] = []> =
    (new (...args: Arguments) => Instance) &
    {
        readonly component: Component;
    }

export class ViewModel {
    protected readonly ctx: ReadableGlobalContext = useGlobalContext(true);

    public constructor() {
    }

    public beforeMount(): void | Promise<void> {
    }

    public mounted(): void | Promise<void> {
    }

    public beforeUpdate(): void | Promise<void> {
    }

    public updated(): void | Promise<void> {
    }

    public beforeUnmount(): void | Promise<void> {
    }

    public unmounted(): void | Promise<void> {
    }

    public activated(): void | Promise<void> {
    }

    public deactivated(): void | Promise<void> {
    }

    protected runAction<T>(action: Action<T>): Promise<T> {
        return new Promise<T>(async(resolve, reject) => {
            const ctx: ActionContext<T> = new ActionContext(resolve, reject);
            await syncio.ensureSync(action.onAction(ctx));
        });
    }
}
