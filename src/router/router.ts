import type {App, Component} from "vue";
import {createRouter, createMemoryHistory, createWebHistory, createWebHashHistory, RouterHistory, Router} from "vue-router";
import { hookPlugin } from "@hook/useMVVM";
import type {ViewModelConstructor, ViewModel} from "@/ViewModel";
import { AppShell } from "vue-mvvm";

declare module "vue-mvvm" {
    interface AppShell {
        router: {
            history?: "memory" | "web" | "web-hash"

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

hookPlugin((app: App, config: AppShell) => {
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

    app.use(router);
});