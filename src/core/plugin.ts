import {type App, type Plugin} from "vue";

import {AppShell} from "@/AppShell";
import {useGlobalContext, WritableGlobalContext, DIContainer} from "@/context";

type PluginHook = (app: App, config: AppShell, ctx: WritableGlobalContext) => void;

const hooks: PluginHook[] = [];

/**
 * @internal
 */
export function hookPlugin(cb: PluginHook): void {
    hooks.push(cb);
}

/**
 * Options for configuring the MVVM plugin.
 */
export interface MVVMOptions {
    /**
     * An optional {@link DIContainer} to use as the global context.
     * If not provided, a new global context will be created.
     */
    context?: DIContainer;
}

/**
 * Configures and prepares a Vue.js App to use the MVVM Library
 *
 * @param config  - The configuration object used to set up services and hooks for the application.
 * @param options - Optional configuration options for MVVM.
 *
 * @return The input {@link app} for function chaining
 */
export function createMVVM(config: AppShell, options: MVVMOptions = {}): Plugin {
    return {
        install(app: App) {
            const ctx: WritableGlobalContext = options.context ?? useGlobalContext();

            config.configureServices(ctx);

            for (const hook of hooks) {
                hook(app, config, ctx);
            }
        }
    }
}