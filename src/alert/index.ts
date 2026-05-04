import {type App} from "vue";
import {type AppShell, type WritableGlobalContext} from "vue-mvvm";

import {hookPlugin} from "@/plugin.js";
import {type AlertControlConstructor} from "@/AlertControl.js";
import {type ConfirmControlConstructor} from "@/ConfirmControl.js";
import {AlertService, setAlertControl, setConfirmControl} from "@/AlertService.js";

export * from "@/AlertControl.js";
export * from "@/ConfirmControl.js";
export {AlertService} from "@/AlertService.js";

declare module "vue-mvvm" {
    export namespace AppShell {
        export interface AlertConfig {
            /**
             * Component used for universal alerts
             */
            alert?: AlertControlConstructor;
            /**
             * Component used for universal confirms
             */
            confirm?: ConfirmControlConstructor;
        }
    }

    export interface AppShell {
        /**
         * Configuration for `vue-mvvm/alert`
         */
        alert: AppShell.AlertConfig;
    }
}

hookPlugin((_: App, config: AppShell, ctx: WritableGlobalContext): void => {
    if (config.alert.alert) {
        setAlertControl(config.alert.alert);
    }
    if (config.alert.confirm) {
        setConfirmControl(config.alert.confirm);
    }

    ctx.registerService(AlertService, ctx => new AlertService(ctx));
});
