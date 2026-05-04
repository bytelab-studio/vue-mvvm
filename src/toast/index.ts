import {type App, type Component} from "vue";
import {type AppShell, type WritableGlobalContext} from "vue-mvvm";

import {hookPlugin} from "@/plugin.js";
import {setInfoControl, setProgressControl, ToastService} from "@/ToastService.js";
import {type InfoToastConstructor, type ProgressToastConstructor} from "@/ToastControl.js";
import {setContainerComponent, ToastProvider} from "@/ToastProvider.js";

export {useToastControl} from "@/hook/useToastControl.js";
export * from "@/ToastControl.js";
export {
    type ToastOptions,
    type ProgressToastOptions,
    type InfoToastOptions,
    ToastService,
    ProgressComponentNotFoundError,
    InfoComponentNotFoundError
} from "@/ToastService.js";
export {
    ToastProvider
}

declare module "vue-mvvm" {
    export namespace AppShell {
        /**
         * Configuration for the toast module.
         */
        export interface ToastConfig {
            /**
             * The constructor for info toasts.
             */
            info?: InfoToastConstructor;

            /**
             * The constructor for progress toasts.
             */
            progress?: ProgressToastConstructor;

            /**
             * The component that will wrap the toasts.
             */
            container: Component;
        }
    }

    export interface AppShell {
        /**
         * Configuration for `vue-mvvm/toast`
         */
        toast: AppShell.ToastConfig;
    }
}

hookPlugin((_: App, config: AppShell, ctx: WritableGlobalContext): void => {
    if (config.toast.info) {
        setInfoControl(config.toast.info);
    }
    if (config.toast.progress) {
        setProgressControl(config.toast.progress);
    }

    setContainerComponent(config.toast.container);

    ctx.registerProvider(ToastProvider);
    ctx.registerService(ToastService, () => new ToastService());
});
