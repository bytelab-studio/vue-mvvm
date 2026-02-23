import {ComponentInternalInstance, getCurrentInstance} from "vue";

import {DialogControl, DialogControlConstructor} from "@/DialogControl";
import {useViewModelInstance} from "@hook/useViewModel";
import {DialogControlMismatchError, HookUsageError, MissingComponentMetadataError} from "@/errors";

export const propSymbol: symbol = Symbol("vue-mvvm-dialog-control");

/**
 * Binds a DialogControl to the current View
 *
 * @param cls - The ViewModel that should be instantiated
 *
 * @returns A instance of the given ViewModel class
 */
export function useDialogControl<Instance extends DialogControl>(cls: DialogControlConstructor<Instance, any[]>): Instance {
    const instance: ComponentInternalInstance | null = getCurrentInstance();
    if (!instance) {
        throw new HookUsageError("useDialogControl");
    }

    if (!instance.vnode.props) {
        throw new MissingComponentMetadataError("Dialog");
    }

    const control: DialogControl | undefined = (instance.vnode.props as any)[propSymbol];
    if (control instanceof cls) {
        useViewModelInstance(control);
        return control;
    }

    throw new DialogControlMismatchError(cls as unknown as Function);
}