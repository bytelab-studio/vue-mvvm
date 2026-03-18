import {Component, defineComponent, Fragment, h} from "vue";

import {propSymbol as toastControlSymbol} from "@/hook/useToastControl";

import {ToastControl, ToastControlConstructor} from "@/ToastControl";
import {WeakArray} from "@/WeakArray";

export const toastRegistry: WeakArray<ToastControl> = new WeakArray<ToastControl>();

export const providerRegistry: Set<Function> = new Set<Function>();

let container: Component | null = null;

/**
 * @internal
 */
export function setContainerComponent(component: Component | null): void {
    container = component;
}

/**
 * A component that renders all active toasts.
 */
export const ToastProvider = defineComponent({
    name: "ToastProvider",
    mounted(): any {
        providerRegistry.add(this.$forceUpdate.bind(this));
    },
    unmounted(): any {
        providerRegistry.delete(this.$forceUpdate);
    },
    setup() {
        return () => h((container ?? Fragment) as any, null, toastRegistry.filter(toast => !toast.destroyed).map(toast => h((toast.constructor as ToastControlConstructor).component, {
            [toastControlSymbol]: toast
        })));
    }
});