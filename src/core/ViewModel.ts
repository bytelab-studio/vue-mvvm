import {type Component, TemplateRef, useTemplateRef} from "vue";
import * as vue from "vue";
import * as syncio from "@/syncio";
import * as reactive from "@/reactive";
import {type ReadableGlobalContext, useGlobalContext} from "@hook/useGlobalContext";
import {exposeSymbol as userControlSymbol} from "@hook/useUserControl"
import {Action, ActionContext, ActionResult} from "@/Action";
import {UserControl} from "@/UserControl";

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

        return reactive.applyReactivity(this);
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
     * Collect a UserControl that is bound to the View using a Vue.js template ref
     *
     * @param ref - The Vue.js Template ref
     *
     * @returns The UserControl of the bounded UI Element
     */
    protected getUserControl<T extends UserControl>(ref: string): T;

    /**
     * Collects multiple UserControls that are bound to the View using a Vue.js template ref
     *
     * @param ref  - The Vue.js Template ref
     * @param many - Expected an array of elements on collection
     *
     * @returns A array with the UserControl of the bounded UI Element
     */
    protected getUserControl<T extends UserControl>(ref: string, many: true): T[];

    protected getUserControl<T extends UserControl>(ref: string, many?: true): T | T[] {
        const reference: TemplateRef<any | any[]> = useTemplateRef(ref);
        if (!reference.value) {
            throw new Error(`UserControl '${ref}' could not be found`);
        }

        const value: any | any[] = reference.value;
        if (Array.isArray(value)) {
            if (!many) {
                throw new Error(`Found multiple UserControl's for '${ref}'`);
            }

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

        if (many) {
            throw new Error(`Found only one UserControl's for '${ref}' (many = true)`);
        }

        if (userControlSymbol in value && value[userControlSymbol] instanceof UserControl) {
            return value as T;
        }

        throw new Error(`UserControl '${ref}' is missing metadata`);
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
