import {type App} from "vue";
import {type AppShell, WritableGlobalContext} from "vue-mvvm";

import {hookPlugin} from "@/plugin";
import {AlertControlConstructor} from "@/AlertControl";
import {ConfirmControlConstructor} from "@/ConfirmControl";
import {AlertService, setAlertControl, setConfirmControl} from "@/AlertService";

export * from "@/AlertControl";
export * from "@/ConfirmControl";
export {AlertService} from "@/AlertService";

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