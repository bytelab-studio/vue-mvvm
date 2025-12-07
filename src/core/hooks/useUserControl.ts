import {ComponentInternalInstance, getCurrentInstance, ShallowRef, useTemplateRef} from "vue";

import {useViewModel} from "@hook/useViewModel";
import {UserControl, UserControlConstructor} from "@/UserControl";
import {HookUsageError} from "@/errors";
import * as reactive from "@/reactive";

export const exposeSymbol: symbol = Symbol("vue-mvvm-user-control");

/**
 * Binds a UserControl to the current View
 *
 * @param cls - The ViewModel that should be instantiated
 *
 * @returns A instance of the given ViewModel class
 */
export function useUserControl<T extends UserControl>(cls: UserControlConstructor<T>): T {
    const vm: T = useViewModel(cls);

    const instance: ComponentInternalInstance | null = getCurrentInstance();
    if (!instance) {
        throw new HookUsageError("useUserControl");
    }
    instance.exposed ??= {};
    // @ts-expect-error
    instance.exposed[exposeSymbol] = vm;

    return vm;
}