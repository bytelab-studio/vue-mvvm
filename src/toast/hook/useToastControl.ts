import {type ComponentInternalInstance, getCurrentInstance} from "vue";
import {DialogControlMismatchError, HookUsageError, MissingComponentMetadataError} from "vue-mvvm";
import {ToastControl, type ToastControlConstructor} from "@/ToastControl.js";
import {useViewModelInstance} from "@hook/useViewModel.js";
import {type ToastOptions} from "@/ToastService.js";

export const propSymbol: symbol = Symbol("vue-mvvm-toast-control");

/**
 * Binds a ToastControl to the current View.
 *
 * @typeParam Instance - The type of the ToastControl.
 * @param cls - The ViewModel class that should be bound.
 * @returns The ToastControl instance passed to the component.
 * @throws {@link HookUsageError} if called outside of a component's setup function.
 * @throws {@link MissingComponentMetadataError} if the component is missing metadata.
 * @throws {@link DialogControlMismatchError} if the provided control is not an instance of the given class.
 */
export function useToastControl<Options extends ToastOptions, Instance extends ToastControl<Options>>(cls: ToastControlConstructor<Options, Instance>): Instance {
    const instance: ComponentInternalInstance | null = getCurrentInstance();
    if (!instance) {
        throw new HookUsageError("useToastControl");
    }

    if (!instance.vnode.props) {
        throw new MissingComponentMetadataError("Toast");
    }

    const control: Instance | undefined = (instance.vnode.props as any)[propSymbol];
    if (control instanceof cls) {
        useViewModelInstance(control as any);
        return control;
    }

    throw new DialogControlMismatchError(cls as unknown as Function);
}