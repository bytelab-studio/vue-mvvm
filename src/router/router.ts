import {App, Component} from "vue";
import {
    createMemoryHistory,
    createRouter,
    createWebHashHistory,
    createWebHistory,
    Router,
    RouterHistory
} from "vue-router";
import {AppShell, syncio, ViewModelConstructor, WritableGlobalContext} from "vue-mvvm";

import {RouterProvider} from "@/RouterProvider";
import {hookPlugin} from "@/plugin";

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

type RouteParamTypes = "integer" | "string";

type RouteParamTypeMap = {
    integer: number;
    string: string;
}

type ExtractRouteParams<VM extends RoutableViewModel> = VM["route"] extends { params: infer R } ? R : undefined;

type RouteParamsParameter<VM extends RoutableViewModel> =
    ExtractRouteParams<VM> extends Record<string, any>
        ? keyof ExtractRouteParams<VM> extends never
            ? [] | [{}]
            : [{
                [K in keyof ExtractRouteParams<VM>]: ExtractRouteParams<VM>[K] extends keyof RouteParamTypeMap
                    ? RouteParamTypeMap[ExtractRouteParams<VM>[K]]
                    : never;
            }]
        : [] | [{}];

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

    /**
     * The type definition of path parameters ("/:myID") in the path property
     */
    params?: Record<string, RouteParamTypes>;
}

export type RoutableViewModel = ViewModelConstructor & {
    /**
     * Static field in a ViewModel exposes routing information used by the RouterService.
     */
    route: RouteAdapter;

    component: Component
}

/**
 * Wrapper class for resolving path parameters
 */
export class RouterParams {
    private router: Router;

    /**
     * @internal
     */
    public constructor(router: Router) {
        this.router = router;
    }

    /**
     * Returns a route parameter as integer.
     */
    public getInteger(name: string): number {
        const raw: string | string[] | undefined = this.router.currentRoute.value.params[name as any];
        if (typeof raw == "undefined") {
            throw new Error(`Route parameter '${name}' was not found`);
        }

        if (Array.isArray(raw)) {
            throw new Error(`Route parameter '${name}' is not a valid integer`);
        }

        // Strict integer check (no spaces, no decimals)
        if (!/^-?\d+$/.test(raw)) {
            throw new Error(`Route parameter '${name}' is not a valid integer`);
        }

        const value: number = Number.parseInt(raw);
        if (!Number.isFinite(value)) {
            throw new Error(`Route parameter '${name}' is not a valid integer`);
        }

        return value;
    }

    /**
     * Returns a route parameter as string.
     */
    public getString(name: string): string {
        const raw: string | string[] | undefined = this.router.currentRoute.value.params[name as any];
        if (typeof raw == "undefined") {
            throw new Error(`Route parameter '${name}' was not found`);
        }

        if (Array.isArray(raw)) {
            throw new Error(`Route parameter '${name}' is not a valid string`);
        }

        return raw;
    }
}

/**
 * Represents an MVVM service wrapper around the `vue-router` functions.
 */
export class RouterService {
    private readonly router: Router;

    public readonly params: RouterParams;

    /**
     * @internal
     */
    public constructor(router: Router) {
        this.router = router;
        this.params = new RouterParams(router);
    }

    /**
     * Programmatically navigate to a new ViewModel by pushing an entry in the history stack.
     *
     * @param vm     - A routable ViewModel
     * @param params - Required path parameters
     */
    public async navigateTo<Route extends RoutableViewModel>(vm: Route, ...params: RouteParamsParameter<Route>): Promise<void> {
        if (params.length == 0) {
            await this.router.push(vm.route.path);
            return;
        }

        const route: string = this.resolvePath(vm.route.path, params);
        await this.router.push(route);
    }

    /**
     * Programmatically navigate to a new ViewModel by replacing the current entry in the history stack.
     *
     * @param vm     - A routable ViewModel
     * @param params - Required path parameters
     */
    public async replaceTo<Route extends RoutableViewModel>(vm: Route, ...params: RouteParamsParameter<Route>): Promise<void> {
        if (params.length == 0) {
            await this.router.replace(vm.route.path);
            return;
        }

        const route: string = this.resolvePath(vm.route.path, params);
        await this.router.replace(route);
    }

    /**
     * Go back in history if possible
     */
    public navigateBack(): void {
        this.router.back();
    }

    /**
     * Returns the native Vue Router instance
     */
    public getNative(): Router {
        return this.router;
    }

    private resolvePath(route: string, params: any[]): string {
        let result: string = route;

        for (const key in params[0]) {
            result = result.replace(`:${key}`, encodeURIComponent(String((params[0] as any)[key])));
        }

        return result;
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

    const metaSymbol: symbol = Symbol("vue-mvvm-router-meta");
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

    ctx.registerProvider(RouterProvider);
    ctx.registerService(RouterService, () => new RouterService(router));
    app.use(router);
});