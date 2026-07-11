import {type ComponentInternalInstance, getCurrentInstance} from "vue";

import {useViewModelInstance} from "@hook/useViewModel.js";
import {UserControl, type UserControlConstructor} from "@/UserControl.js";
import {HookUsageError} from "@/errors.js";

export const exposeSymbol: symbol = Symbol("vue-mvvm-user-control");

/**
 * Binds a UserControl to the current View
 *
 * @param cls  - The ViewModel that should be instantiated
 * @param args - The arguments of the ViewModel's constructor 
 *
 * @returns A instance of the given ViewModel class
 */
export function useUserControl<Instance extends UserControl, const Arguments extends [...unknown[]]>(cls: UserControlConstructor<Instance, Arguments>, ...args: Arguments): T {
    const vm: Instance = new cls(...arguments);
    useViewModelInstance(vm);

    const instance: ComponentInternalInstance | null = getCurrentInstance();
    if (!instance) {
        throw new HookUsageError("useUserControl");
    }
    instance.exposed ??= {};
    // @ts-expect-error
    instance.exposed[exposeSymbol] = vm;

    return vm;
}
