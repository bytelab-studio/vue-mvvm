import {useViewModel} from "@hook/useViewModel";
import {UserControl, UserControlConstructor} from "@/UserControl";
import {defineExpose} from "vue";

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

    defineExpose({
        [exposeSymbol]: vm
    });

    return vm;
}