import {defineComponent, Fragment, h} from "vue";

import {propSymbol as dialogControlSymbol} from "@/hooks/useDialogControl";

import type {DialogControl, DialogControlConstructor} from "@/DialogControl";
import {WeakArray} from "@/WeakArray";

const dialogRegistry: WeakArray<DialogControl> = new WeakArray<DialogControl>()
const providerRegistry: Set<Function> = new Set<Function>();

/**
 * Represents an MVVM service for instantiating dialogs from any ViewModel
 */
export class DialogService {
    /**
     * Renders a new instance of a DialogControl using the provided arguments.
     *
     * @param cls  - The class constructor for the DialogControl.
     * @param args - The arguments to pass to the dialog control constructor.
     *
     * @return The newly created instance of the dialog control.
     *
     * @example
     * class MyDialogControl extends DialogControl {
     *     public isOpen: Ref<boolean> = ref(false);
     *
     *     public constructor(message: string) {
     *         // Do something with the message...
     *     }
     *
     *     public onOpen() {
     *         this.isOpen.value = true;
     *     }
     *
     *     public onClose() {
     *         this.isOpen.value = false;
     *
     *         // Since we only show a message, we can destroy the dialog afterward
     *         this.destroy();
     *     }
     * }
     *
     * class MainViewModel extends ViewModel {
     *     private dialog: DialogService = this.ctx.getService(DialogService);
     *
     *     // can be called multiple times
     *     public async openDialog(): Promise<void> {
     *         // instantiate a new dialog
     *         const dialog: MyDialogControl = this.dialog.initDialog(MyDialogControl, "Some message");
     *
     *         // open the dialog
     *         await dialog.openDialog();
     *
     *         // at this point we could call this.runAction(dialog) to await a dialog's action
     *     }
     * }
     *
     *
     */
    public initDialog<Instance extends DialogControl, const Arguments extends [...unknown[]]>(cls: DialogControlConstructor<Instance, Arguments>, ...args: Arguments): Instance {
        const instance: Instance = new cls(...args);
        dialogRegistry.push(instance);

        for (const provider of providerRegistry) {
            provider();
        }

        return instance;
    }
}

/**
 * DialogProvider is a Vue.js component responsible for managing and rendering DialogControls dynamically.
 *
 * It acts as a provider for dialog services, allowing proper registration and lifecycle management of dialogs.
 */
export const DialogProvider = defineComponent({
    name: "DialogProvider",
    mounted(): any {
        providerRegistry.add(this.$forceUpdate.bind(this));
    },
    unmounted(): any {
        providerRegistry.delete(this.$forceUpdate);
    },
    setup() {
        return () => h(Fragment, null, dialogRegistry.filter(dialog => !dialog.destroyed.value).map(dialog => h((dialog.constructor as DialogControlConstructor<any>).component, {
            [dialogControlSymbol]: dialog
        })));
    }
});
