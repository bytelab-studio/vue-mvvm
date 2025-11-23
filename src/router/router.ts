import type {App} from "vue";
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
import {AppShell, ViewModelConstructor, WritableGlobalContext} from "vue-mvvm";

declare module "vue-mvvm" {
    interface AppShell {
        /**
         * Configuration for the vue-router
         */
        router: {
            /**
             * The strategy to build a router history. Default is `"web"`
             *
             * - `"memory"`: Creates an in-memory based history. The main purpose of this history is to handle SSR.
             * - `"web"`: Creates an HTML5 history. Most common history for single-page applications.
             * - `"web-hash"`: Creates a hash history. Useful for web applications with no host (e.g. `file://`)
             * or when configuring a server to handle any URL is not possible.
             */
            history?: "memory" | "web" | "web-hash";

            /**
             * All routable ViewModel's that should be registered to the `vue-router`
             */
            views: RoutableViewModel[];
        }
    }
}

type RouteAdapterGuardReturn = true | RoutableViewModel | Promise<true | RoutableViewModel>;

/**
 * Adapter to expose routing information used by the RouterService.
 */
export interface RouteAdapter {
    /**
     * Optional method to provide a guard for route access.
     * This method allows implementing route-level restrictions or validations
     * before granting access to a specific route within the application.
     *
     * @return {RouteAdapterGuardReturn} The result of the guard evaluation, which is either `true` or another
     * `ViewModel` to which the router should redirect. On redirection the guard, if defined,
     * of the redirecting item will be executed
     */
    guard?(): RouteAdapterGuardReturn;

    /**
     * The path that the Item should listen to. Follows the same syntax like the vue-router path definition syntax
     */
    path: string;
}

export type RoutableViewModel = ViewModelConstructor & {
    /**
     * Static field in a ViewModel exposes routing information used by the RouterService.
     */
    route: RouteAdapter;
}

/**
 * Represents an MVVM service wrapper around the `vue-router` functions.
 */
export class RouterService {
    private router: Router;

    /**
     * @internal
     */
    public constructor(router: Router) {
        this.router = router;
    }

    /**
     * Programmatically navigate to a new ViewModel by pushing an entry in the history stack.
     *
     * @param vm - A routeable ViewModel
     */
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