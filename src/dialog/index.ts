import {type App} from "vue";
import {type AppShell, type WritableGlobalContext} from "vue-mvvm";

import {hookPlugin} from "@/plugin";
import {DialogProvider, DialogService} from "@/DialogProvider";

export {useDialogControl} from "@/hooks/useDialogControl";
export * from "@/DialogControl";
export {
    DialogProvider,
    DialogService
}

hookPlugin((_: App, __: AppShell, ctx: WritableGlobalContext) => {
    ctx.registerProvider(DialogProvider);
    ctx.registerService(DialogService, () => new DialogService());
});