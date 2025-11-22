import {defineComponent, Fragment, h} from "vue";
import {useGlobalContext, type WritableGlobalContext} from "@hook/useGlobalContext";
import {propSymbol as dialogControlSymbol} from "@hook/useDialogControl";
import type {DialogControl, DialogControlConstructor} from "@/DialogControl";
import {WeakArray} from "@/WeakArray";

const dialogRegistry: WeakArray<DialogControl> = new WeakArray<DialogControl>()
const providerRegistry: Set<Function> = new Set<Function>();

export class DialogService {
    public initDialog<Instance extends DialogControl, const Arguments extends [...unknown[]]>(cls: DialogControlConstructor<Instance, Arguments>, ...args: Arguments): Instance {
        const instance: Instance = new cls(...args);
        dialogRegistry.push(instance);

        for (const provider of providerRegistry) {
            provider();
        }

        return instance;
    }
}

let registered: boolean = false;

export const DialogProvider = defineComponent({
    name: "DialogProvider",
    beforeCreate() {
        if (!registered) {
            const ctx: WritableGlobalContext = useGlobalContext();
            ctx.registerService(DialogService, () => new DialogService());
            registered = true;
        }
    },
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
