import type {App, Component} from "vue";
import {
    createMemoryHistory,
    createRouter,
    createWebHashHistory,
    createWebHistory,
    Router,
    RouterHistory
} from "vue-router";
import {hookPlugin} from "@hook/useMVVM";
import * as syncio from "@/syncio";
import {AppShell, ViewModel, ViewModelConstructor, WritableGlobalContext} from "vue-mvvm";

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

export class RouterService {
    private router: Router;

    public constructor(router: Router) {
        this.router = router;
    }

    public async navigateTo(vm: RoutableViewModel): Promise<void> {
        await this.router.push(vm.route.path);
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
        case "web":
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
        let result: Awaited<RouteAdapterGuardReturn> = await syncio.ensureSync(metadata.route.guard());

        if (typeof result == "boolean" && result) {
            return true;
        }

        return {
            path: result.route.path
        }
    });

    ctx.registerService(RouterService, () => new RouterService(router));
    app.use(router);
});