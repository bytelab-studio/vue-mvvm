import {type App, Component} from "vue";
import {type AppShell, WritableGlobalContext} from "vue-mvvm";

import {hookPlugin} from "@/plugin";
import {setInfoControl, setProgressControl, ToastService} from "@/ToastService";
import {InfoToastConstructor, ProgressToastConstructor} from "@/ToastControl";
import {setContainerComponent, ToastProvider} from "@/ToastProvider";

export {useToastControl} from "@/hook/useToastControl";
export * from "@/ToastControl";
export {
    ToastOptions,
    ProgressToastOptions,
    InfoToastOptions,
    ToastService,
    ProgressComponentNotFoundError,
    InfoComponentNotFoundError
} from "@/ToastService";
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
