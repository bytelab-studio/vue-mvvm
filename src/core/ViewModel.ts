import {type Component, onMounted} from "vue";
import * as syncio from "@/syncio";
import {type ReadableGlobalContext, useGlobalContext} from "@hook/useGlobalContext";
import {Action, ActionContext, ActionResult} from "@/Action";

/**
 * A type definition for a valid ViewModel class constructor.
 */
export type ViewModelConstructor<Instance extends ViewModel = ViewModel, Arguments extends [...unknown[]] = []> =
    (new (...args: Arguments) => Instance) &
    {
        readonly component: Component;
    }

/**
 * The ViewModel is the lowest possible abstraction class in MVVM.
 * It declares basic Vue lifecycle hooks
 */
export class ViewModel {

    /**
     * Represents a readonly global context that provides features like DI
     */
    protected readonly ctx: ReadableGlobalContext;

    public constructor() {
        this.ctx = useGlobalContext(true);
    }

    /**
     * Hook for Vue's `onBeforeMount`
     */
    public beforeMount(): void | Promise<void> {
    }

    /**
     * Hook for Vue's `onMounted`
     */
    public mounted(): void | Promise<void> {
    }

    /**
     * Hook for Vue's `onBeforeUpdate`
     */
    public beforeUpdate(): void | Promise<void> {
    }

    /**
     * Hook for Vue's `onUpdated`
     */
    public updated(): void | Promise<void> {
    }

    /**
     * Hook for Vue's `onBeforeUnmount`
     */
    public beforeUnmount(): void | Promise<void> {
    }

    /**
     * Hook for Vue's `onUnmounted`
     */
    public unmounted(): void | Promise<void> {
    }

    /**
     * Hook for Vue's `onActivated`
     */
    public activated(): void | Promise<void> {
    }

    /**
     * Hook for Vue's `onDeactivated`
     */
    public deactivated(): void | Promise<void> {
    }
    
    /**
     * Executes an MVVM Action and returns its result as a promise.
     *
     * Notes
     * - The action body may be synchronous or asynchronous; both are supported.
     * - If the action tries to complete/fail more than once, a Vue warning is emitted and further
     * attempts are ignored.
     *
     * @param action - The action object implementing {@link Action} interface.
     * @returns A promise that resolves with an {@link ActionResult} carrying either the data on
     * success or an error on failure.
     *
     */
    protected runAction<T>(action: Action<T>): Promise<ActionResult<T>> {
        return new Promise<ActionResult<T>>( async (resolve): Promise<void> => {
            const ctx: ActionContext<T> = new ActionContext(resolve);
            await syncio.ensureSync(action.onAction(ctx));
        });
    }
}
