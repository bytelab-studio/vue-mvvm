import * as vue from "vue";
import * as syncio from "@/syncio";
import * as reactive from "@/reactive";
import {type ReadableGlobalContext, useGlobalContext} from "@/context";
import {exposeSymbol as userControlSymbol} from "@hook/useUserControl"
import {Action, ActionContext, ActionResult} from "@/Action";
import {UserControl} from "@/UserControl";

/**
 * A type definition for a valid ViewModel class constructor.
 */
export type ViewModelConstructor<Instance extends ViewModel = ViewModel, Arguments extends [...unknown[]] = []> = (new (...args: Arguments) => Instance);

/**
 * An interface representing a handle to control a watcher
 */
export interface WatchHandle {
    stop(): void;

    pause(): void;

    resume(): void;
}

/**
 * The ViewModel is the lowest possible abstraction class in MVVM.
 * It declares basic Vue lifecycle hooks
 */
export class ViewModel {
    private watchHandles: vue.WatchHandle[];

    /**
     * Represents a readonly global context that provides features like DI
     */
    protected readonly ctx: ReadableGlobalContext;

    public constructor() {
        this.watchHandles = [];
        this.ctx = useGlobalContext(true);

        return reactive.applyReactivity(this);
    }

    /**
     * @internal
     */
    public disposeWatchers(): void {
        for (const handle of this.watchHandles) {
            handle.stop();
        }

        this.watchHandles = [];
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
        return new Promise<ActionResult<T>>(async (resolve): Promise<void> => {
            const ctx: ActionContext<T> = new ActionContext(resolve);
            await syncio.ensureSync(action.onAction(ctx));
        });
    }

    /**
     * Collect UserControl that are bound to the View using a Vue.js template ref
     *
     * @param ref  - The Vue.js Template ref
     *
     * @returns UserControl of the bounded UI Element
     */
    protected getUserControl<T extends UserControl | UserControl[]>(ref: string): T | null {
        const reference: Readonly<vue.ShallowRef> = vue.useTemplateRef(ref);

        return reactive.computed(() => {
            if (!reference.value) {
                return null;
            }

            const value: any | any[] = reference.value;
            if (Array.isArray(value)) {
                const result: T[] = [];

                for (let i: number = 0; i < value.length; i++) {
                    const item: any = value[i];

                    if (userControlSymbol in item && item[userControlSymbol] instanceof UserControl) {
                        result.push(item[userControlSymbol] as T);
                        continue;
                    }

                    throw new Error(`UserControl '${ref}', at index ${i} is missing metadata`);
                }

                return result;
            }

            if (userControlSymbol in value && value[userControlSymbol] instanceof UserControl) {
                return value[userControlSymbol] as T;
            }

            throw new Error(`UserControl '${ref}' is missing metadata`);
        }) as T | null;
    }

    /**
     * Sets up a watch on a reactive source and registers the watch handle.
     * Allows tracking and managing the lifecycle of the watch handle within the class.
     *
     * Additionally, watchers are automatically disposed of after the component is unmounted
     * and all lifecycle hooks have finished executing.
     *
     * @param source  - The reactive source to watch.
     * @param cb      - The callback function that gets triggered when the source changes.
     * @param options - Optional configuration object for the watcher (e.g., deep, immediate).
     *
     * @return A custom watch handle with methods to stop, pause, and resume the watcher.
     */
    protected watch(source: vue.WatchHandle, cb: vue.WatchCallback, options?: vue.WatchOptions): WatchHandle {
        const handle: vue.WatchHandle = vue.watch(source, cb, options);
        this.watchHandles.push(handle);

        let revoked: boolean = false;
        return {
            stop: () => {
                if (revoked) {
                    return;
                }

                revoked = true;
                this.watchHandles = this.watchHandles.filter(x => x != handle);
            },
            pause: handle.pause,
            resume: handle.resume
        }
    }

    protected ref<T>(initial: T): T {
        return reactive.ref(initial) as T;
    }

    protected computed<T>(getter: vue.ComputedGetter<T>): T;
    protected computed<T>(options: { get: vue.ComputedGetter<T>, set: vue.ComputedSetter<T> }): T;
    protected computed<T>(arg: any): T {
        return reactive.computed(arg) as T;
    }
}
