import type { App, Component } from "vue";
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory, RouterHistory, Router, useRouter } from "vue-router";
import { hookPlugin } from "@hook/useMVVM";
import { AppShell, WritableGlobalContext, ViewModelConstructor, ViewModel } from "vue-mvvm";

declare module "vue-mvvm" {
    interface AppShell {
        router: {
            history?: "memory" | "web" | "web-hash";

            views: RoutableViewModel[];
        }
    }
}

type RouteAdapterGuardReturn = true | RoutableViewModel | Promise<true | RoutableViewModel>;

export interface RouteAdapter {
    guard?(): RouteAdapterGuardReturn;

    path: string;
}

export type RoutableViewModel = ViewModelConstructor<ViewModel> & {
    component: Component;
    route: RouteAdapter;
}

export interface RouterService {
    navigateTo(vm: RoutableViewModel): Promise<void>;
}

function setupService(router: Router): RouterService {
    return {
        async navigateTo(vm: RoutableViewModel): Promise<void> {
            await router.push(vm.route.path);
        }
    }
}

hookPlugin((app: App, config: AppShell, ctx: WritableGlobalContext) => {
    let history: RouterHistory;
    switch (config.router.history) {
        case "memory":
            history = createMemoryHistory();
            break;
        case "web-hash":
            history = createWebHashHistory();
            break;
        case "memory":
        default:
            history = createWebHistory();
            break;
    }

    const metaSymbol = Symbol("vue-mvvm-router-meta");
    const router: Router = createRouter({
        history: history,
        routes: config.router.views.map(view => ({
            path: view.route.path,
            component: view.component,
            meta: {
                [metaSymbol]: view
            }
        }))
    });

    router.beforeEach(async (to) => {
        const metadata: RoutableViewModel | undefined = to.meta[metaSymbol] as RoutableViewModel | undefined;
        if (!metadata) {
            return;
        }

        if (!metadata.route.guard) {
            return;
        }
        let result: RouteAdapterGuardReturn = metadata.route.guard();
        if (result instanceof Promise) {
            result = await result;
        }

        if (typeof result == "boolean" && result) {
            return true;
        }

        return {
            path: result.route.path
        }
    });

    ctx.registerService("router", setupService(router));

    app.use(router);
});