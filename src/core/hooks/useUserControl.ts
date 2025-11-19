import { useViewModel } from "@hook/useViewModel";
import { UserControl, UserControlConstructor } from "@/UserControl";
import { TemplateRef, useTemplateRef } from "vue";

const exposeSymbol: symbol = Symbol("vue-mvvm-user-control");

export function useUserControl<T extends UserControl>(vmCLS: UserControlConstructor<T>): T;
export function useUserControl<T extends UserControl>(ref: string): T;

export function useUserControl<T extends UserControl>(arg0: UserControlConstructor<T> | string): T {
    if (typeof arg0 == "string") {
        const reference: TemplateRef<any> = useTemplateRef(arg0);
        if (reference.value && 
            exposeSymbol in reference.value && 
            reference.value[exposeSymbol] instanceof UserControl) {
            return reference.value[exposeSymbol] as T;
        }

        throw new Error(`UserControl '${arg0}' could not be found`);
    }
    
    const vm: T = useViewModel(arg0);

    defineExpose({
        [exposeSymbol]: vm
    });

    return vm;
}