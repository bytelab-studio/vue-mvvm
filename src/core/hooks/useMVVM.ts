import type { App } from "vue";
import { AppShell } from "@/AppShell";
import { useGlobalContext, type WritableGlobalContext } from "./useGlobalContext";

type PluginHook = (app: App, config: AppShell, ctx: WritableGlobalContext) => void;

const hooks: PluginHook[] = [];

export function hookPlugin(cb: PluginHook): void {
    hooks.push(cb);
}

export function useMVVM(app: App, config: AppShell): App {
    const ctx: WritableGlobalContext = useGlobalContext();

    config.configureServices(ctx);
    
    for (const hook of hooks) {
        hook(app, config, ctx);
    }

    return app;
}
