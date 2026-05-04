import {type App} from "vue";
import {type AppShell, type WritableGlobalContext} from "vue-mvvm";

import {hookPlugin} from "@/plugin.js";
import {DialogProvider, DialogService} from "@/DialogProvider.js";

export {useDialogControl} from "@/hooks/useDialogControl.js";
export * from "@/DialogControl.js";
export {
    DialogProvider,
    DialogService
}

hookPlugin((_: App, __: AppShell, ctx: WritableGlobalContext) => {
    ctx.registerProvider(DialogProvider);
    ctx.registerService(DialogService, () => new DialogService());
});