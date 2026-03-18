import {App, Component} from "vue";
import {
    createMemoryHistory,
    createRouter,
    createWebHashHistory,
    createWebHistory,
    Router,
    RouteRecordRaw,
    RouteRecordSingleView,
    RouterHistory
} from "vue-router";
import {AppShell, syncio, ViewModelConstructor, WritableGlobalContext} from "vue-mvvm";

import {RouterProvider} from "@/RouterProvider";
import {hookPlugin} from "@/plugin";

declare module "vue-mvvm" {
    export namespace AppShell {
        export type LazyRoutableViewModel<T extends RoutableViewModel = RoutableViewModel> = [T["route"]["path"], () => Promise<RoutableViewModel>]

        export interface RouterConfig {
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
            views: Array<RoutableViewModel | LazyRoutableViewModel>;
        }
    }

    export interface AppShell {
        /**
         * Configuration for the vue-router
         */
        router: AppShell.RouterConfig;
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
     * @return The result of the guard evaluation, which is either `true` or another
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

    native?: Omit<RouteRecordSingleView, "component" | "path" | "beforeEnter" | "children">;
}

export type RoutableViewModel = ViewModelConstructor & {
    /**
     * Static field in a ViewModel exposes routing information used by the RouterService.
     */
    route: RouteAdapter;

    component: Component
}

/**
 * Wrapper class for resolving query parameters
 */
export class RouterQuery {
    private router: Router;

    /**
     * @internal
     */
    public constructor(router: Router) {
        this.router = router;
    }

    /**
     * Retrieves an integer query parameter.
     *
     * If the parameter is missing or cannot be parsed as a safe integer,
     * `null` is returned.
     *
     *
     * @param name The query parameter name.
     * @param many Reads multiple values of the parameter (See overload).
     *
     * @returns A integer or `null`
     */
    public getIntegerOrDefault(name: string, many?: false): number | null;

    /**
     * Retrieves an integer query parameter.
     *
     * If the parameter is missing or cannot be parsed as a safe integer,
     * `null` is returned.
     *
     * If `strict` is enabled, the method returns `null`
     * if any value cannot be parsed as an integer, otherwise 
     * the faulty value is ignored 
     *
     * @param name   - The query parameter name.
     * @param many   - Reads multiple values of the parameter.
     * @param strict - When `true`, parsing fails if any value is invalid.
     *
     * @returns A integer array or `null` 
     */
    public getIntegerOrDefault(name: string, many: true, strict: boolean): number[] | null;

    public getIntegerOrDefault(name: string, many: boolean = false, strict: boolean = false): number | number[] | null {
        if (many) {
            return this.getIntegerOrDefaultMany(name, strict);
        }

        return this.getIntegerOrDefaultSingle(name);
    }

    /**
     * Retrieves an integer query parameter.
     *
     * Throws an error if the parameter does not exist or cannot be parsed
     * as a safe integer.
     *
     * @param name   - The query parameter name.
     * @param many   - Reads multiple values of the parameter (See overload).
     *
     * @throws If the parameter is missing or cannot be parsed.
     *
     * @returns A integer
     */
    public getIntegerOrThrow(name: string, many?: false): number;
    /**
     * Retrieves an integer query parameter.
     *
     * Throws an error if the parameter does not exist or cannot be parsed
     * as a safe integer.
     *
     * @param name   - The query parameter name.
     * @param many   - Reads multiple values of the parameter.
     * @param strict - When `true`, parsing fails if any value is invalid.
     *
     * @throws If the parameter is missing or cannot be parsed.
     *
     * @returns A integer array
     */
    public getIntegerOrThrow(name: string, many: true, strict: boolean): number[];

    public getIntegerOrThrow(name: string, many: boolean = false, strict: boolean = false): number | number[] {
        if (many) {
            const values: number[] | null = this.getIntegerOrDefaultMany(name, strict);
            if (values == null) {
                throw new Error(`Query parameter '${name}' was not found or could not be parsed`);
            }

            return values;
        }

        const value: number | null = this.getIntegerOrDefaultSingle(name);
        if (value == null) {
            throw new Error(`Query parameter '${name}' was not found or could not be parsed`);
        }

        return value;
    }

    private getIntegerOrDefaultMany(name: string, strict: boolean): number[] | null {
        const values: string[] | null = this.getStringOrDefaultMany(name);
        if (values == null) {
            return null;
        }

        const integers: number[] = [];
        for (const value of values) {
            const integer: number | null = this.parseInt(value);
            if (integer != null) {
                integers.push(integer);
                continue;
            }

            if (strict) {
                return null;
            }
        }

        return integers;
    }

    private getIntegerOrDefaultSingle(name: string): number | null {
        const value: string | null = this.getStringOrDefaultSingle(name);
        if (value == null) {
            return null;
        }

        return this.parseInt(value);
    }

    private parseInt(value: string): number | null {
        if (!/^-?\d+$/.test(value)) {
            return null;
        }

        const int = Number(value);
        if (Number.isNaN(int) || !Number.isSafeInteger(int)) {
            return null;
        }

        return int;
    }    

    /**
     * Retrieves a string query parameter.
     *
     * If the parameter is missing, `null` is returned.
     *
     * @param name - The query parameter name.
     * @param many - Reads multiple values of the parameter (See overload).
     *
     * @returns A string or null
     */    
    public getStringOrDefault(name: string, many?: false): string | null;
    /**
     * Retrieves a string query parameter.
     *
     * If the parameter is missing, `null` is returned.
     *
     * @param name - The query parameter name.
     * @param many - Reads multiple values of the parameter.
     *
     * @returns A string array or null
     */
    public getStringOrDefault(name: string, many: true): string[] | null;

    public getStringOrDefault(name: string, many: boolean = false): string | string[] | null {
        if (many) {
            return this.getStringOrDefaultMany(name);
        }

        return this.getStringOrDefaultSingle(name);
    }

    /**
     * Retrieves a string query parameter.
     *
     * Throws an error if the parameter does not exist.
     *
     * @param name - The query parameter name.
     * @param many - Reads multiple values of the parameter (See overload).
     *
     * @throws If the parameter does not exist.
     *
     * @returns A string
     */
    public getStringOrThrow(name: string, many?: false): string;
    /**
     * Retrieves a string query parameter.
     *
     * Throws an error if the parameter does not exist.
     *
     * @param name - The query parameter name.
     * @param many - Reads multiple values of the parameter.
     *
     * @throws Error If the parameter does not exist.
     *
     * @returns A string array
     */
    public getStringOrThrow(name: string, many: true): string[];

    public getStringOrThrow(name: string, many: boolean = false): string | string[] {
        if (many) {
            const values: string[] | null = this.getStringOrDefaultMany(name);
            if (values == null) {
                throw new Error(`Query parameter '${name}' was not found`);
            }

            return values;
        }

        const value: string | null = this.getStringOrDefaultSingle(name);
        if (value == null) {
            throw new Error(`Query parameter '${name}' was not found`);
        }

        return value;
    }

    private getStringOrDefaultMany(name: string): string[] | null {
        const raw: string | null | Array<string | null> | undefined = this.router.currentRoute.value.query[name];
        if (typeof raw == "undefined" || raw == null) {
            return null;
        }

        if (!Array.isArray(raw)) {
            return [raw];
        }

        return raw.filter(x => x != null);
    }

    private getStringOrDefaultSingle(name: string): string | null {
        const raw: string | null | Array<string | null> | undefined = this.router.currentRoute.value.query[name];
        if (typeof raw == "undefined" || raw == null || Array.isArray(raw)) {
            return null;
        }

        return raw;
    }
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
     * Retrieves an integer path parameter.
     *
     * If the parameter is missing or cannot be parsed as a safe integer,
     * `null` is returned.
     *
     *
     * @param name The path parameter name.
     * @param many Reads multiple values of the parameter (See overload).
     *
     * @returns A integer or `null`
     */
    public getIntegerOrDefault(name: string, many?: false): number | null;

    /**
     * Retrieves an integer path parameter.
     *
     * If the parameter is missing or cannot be parsed as a safe integer,
     * `null` is returned.
     *
     * If `strict` is enabled, the method returns `null`
     * if any value cannot be parsed as an integer, otherwise 
     * the faulty value is ignored 
     *
     * @param name   - The path parameter name.
     * @param many   - Reads multiple values of the parameter.
     * @param strict - When `true`, parsing fails if any value is invalid.
     *
     * @returns A integer array or `null` 
     */
    public getIntegerOrDefault(name: string, many: true, strict: boolean): number[] | null;

    public getIntegerOrDefault(name: string, many: boolean = false, strict: boolean = false): number | number[] | null {
        if (many) {
            return this.getIntegerOrDefaultMany(name, strict);
        }

        return this.getIntegerOrDefaultSingle(name);
    }

    /**
     * Retrieves an integer path parameter.
     *
     * Throws an error if the parameter does not exist or cannot be parsed
     * as a safe integer.
     *
     * @param name   - The query parameter name.
     * @param many   - Reads multiple values of the parameter (See overload).
     *
     * @throws If the parameter is missing or cannot be parsed.
     *
     * @returns A integer
     */
    public getIntegerOrThrow(name: string, many?: false): number;
    /**
     * Retrieves an integer path parameter.
     *
     * Throws an error if the parameter does not exist or cannot be parsed
     * as a safe integer.
     *
     * @param name   - The path parameter name.
     * @param many   - Reads multiple values of the parameter.
     * @param strict - When `true`, parsing fails if any value is invalid.
     *
     * @throws If the parameter is missing or cannot be parsed.
     *
     * @returns A integer array
     */
    public getIntegerOrThrow(name: string, many: true, strict: boolean): number[];

    public getIntegerOrThrow(name: string, many: boolean = false, strict: boolean = false): number | number[] {
        if (many) {
            const values: number[] | null = this.getIntegerOrDefaultMany(name, strict);
            if (values == null) {
                throw new Error(`Path parameter '${name}' was not found or could not be parsed`);
            }

            return values;
        }

        const value: number | null = this.getIntegerOrDefaultSingle(name);
        if (value == null) {
            throw new Error(`Path parameter '${name}' was not found or could not be parsed`);
        }

        return value;
    }

    private getIntegerOrDefaultMany(name: string, strict: boolean): number[] | null {
        const values: string[] | null = this.getStringOrDefaultMany(name);
        if (values == null) {
            return null;
        }

        const integers: number[] = [];
        for (const value of values) {
            const integer: number | null = this.parseInt(value);
            if (integer != null) {
                integers.push(integer);
                continue;
            }

            if (strict) {
                return null;
            }
        }

        return integers;
    }

    private getIntegerOrDefaultSingle(name: string): number | null {
        const value: string | null = this.getStringOrDefaultSingle(name);
        if (value == null) {
            return null;
        }

        return this.parseInt(value);
    }

    private parseInt(value: string): number | null {
        if (!/^-?\d+$/.test(value)) {
            return null;
        }

        const int = Number(value);
        if (Number.isNaN(int) || !Number.isSafeInteger(int)) {
            return null;
        }

        return int;
    }    

    /**
     * Retrieves a string path parameter.
     *
     * If the parameter is missing, `null` is returned.
     *
     * @param name - The path parameter name.
     * @param many - Reads multiple values of the parameter (See overload).
     *
     * @returns A string or null
     */    
    public getStringOrDefault(name: string, many?: false): string | null;
    /**
     * Retrieves a string path parameter.
     *
     * If the parameter is missing, `null` is returned.
     *
     * @param name - The query parameter name.
     * @param many - Reads multiple values of the parameter.
     *
     * @returns A string array or null
     */
    public getStringOrDefault(name: string, many: true): string[] | null;

    public getStringOrDefault(name: string, many: boolean = false): string | string[] | null {
        if (many) {
            return this.getStringOrDefaultMany(name);
        }

        return this.getStringOrDefaultSingle(name);
    }

    /**
     * Retrieves a string path parameter.
     *
     * Throws an error if the parameter does not exist.
     *
     * @param name - The path parameter name.
     * @param many - Reads multiple values of the parameter (See overload).
     *
     * @throws If the parameter does not exist.
     *
     * @returns A string
     */
    public getStringOrThrow(name: string, many?: false): string;
    /**
     * Retrieves a string path parameter.
     *
     * Throws an error if the parameter does not exist.
     *
     * @param name - The path parameter name.
     * @param many - Reads multiple values of the parameter.
     *
     * @throws Error If the parameter does not exist.
     *
     * @returns A string array
     */
    public getStringOrThrow(name: string, many: true): string[];

    public getStringOrThrow(name: string, many: boolean = false): string | string[] {
        if (many) {
            const values: string[] | null = this.getStringOrDefaultMany(name);
            if (values == null) {
                throw new Error(`Path parameter '${name}' was not found`);
            }

            return values;
        }

        const value: string | null = this.getStringOrDefaultSingle(name);
        if (value == null) {
            throw new Error(`Path parameter '${name}' was not found`);
        }

        return value;
    }

    private getStringOrDefaultMany(name: string): string[] | null {
        const raw: string | null | Array<string | null> | undefined = this.router.currentRoute.value.query[name];
        if (typeof raw == "undefined" || raw == null) {
            return null;
        }

        if (!Array.isArray(raw)) {
            return [raw];
        }

        return raw.filter(x => x != null);
    }

    private getStringOrDefaultSingle(name: string): string | null {
        const raw: string | null | Array<string | null> | undefined = this.router.currentRoute.value.query[name];
        if (typeof raw == "undefined" || raw == null || Array.isArray(raw)) {
            return null;
        }

        return raw;
    }

    /**
     * Returns a route parameter as integer.
     * 
     * @deprecated Use {@link getIntegerOrDefault} or {@link getIntegerOrThrow} instead 
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

        const value: number = Number.parseInt(raw, 10);
        if (!Number.isFinite(value)) {
            throw new Error(`Route parameter '${name}' is not a valid integer`);
        }

        return value;
    }

    /**
     * Returns a route parameter as string.
     *  
     * @deprecated Use {@link getStringOrDefault} or {@link getStringOrThrow} instead 
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
    public readonly query: RouterQuery;

    /**
     * @internal
     */
    public constructor(router: Router) {
        this.router = router;
        this.params = new RouterParams(router);
        this.query = new RouterQuery(router);
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
        routes: config.router.views.map(view => {
            if (Array.isArray(view)) {
                const [path, loader] = view;

                return {
                    path,
                    component: async () => (await loader()).component,
                    meta: {
                        [metaSymbol]: view
                    }
                } satisfies RouteRecordRaw;
            }

            const native: RouteAdapter["native"] = view.route.native;
            
            return {
                ...native,
                path: view.route.path,
                component: view.component,
                meta: {
                    ...native?.meta ?? {},
                    [metaSymbol]: view
                }
            } satisfies RouteRecordRaw;
        })
    });

    router.beforeEach(async (to) => {
        const metadata: RoutableViewModel | AppShell.LazyRoutableViewModel | undefined = to.meta[metaSymbol] as RoutableViewModel | AppShell.LazyRoutableViewModel | undefined;
        if (!metadata) {
            return;
        }

        let component: RoutableViewModel;

        if (Array.isArray(metadata)) {
            const [, loader] = metadata;
            component = await loader();
        } else {
            component = metadata;
        }

        if (!component.route.guard) {
            return;
        }
        let result: Awaited<RouteAdapterGuardReturn> = await syncio.ensureSync(component.route.guard());

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