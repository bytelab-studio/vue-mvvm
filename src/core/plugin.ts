import {type App, type Component, type Plugin} from "vue";

import {AppShell} from "@/AppShell";
import {useGlobalContext, WritableGlobalContext} from "@/context";

type PluginHook = (app: App, config: AppShell, ctx: WritableGlobalContext) => void;

const hooks: PluginHook[] = [];

/**
 * @internal
 */
export function hookPlugin(cb: PluginHook): void {
    hooks.push(cb);
}

/**
 * Configures and prepares a Vue.js App to use the MVVM Library
 *
 * @param {AppShell} config - The configuration object used to set up services and hooks for the application.
 *
 * @return The input {@link app} for function chaining
 */
export function createMVVM(config: AppShell): Plugin {
    return {
        install(app: App) {
            const ctx: WritableGlobalContext = useGlobalContext();

            config.configureServices(ctx);

            for (const hook of hooks) {
                hook(app, config, ctx);
            }
        }
    }
}