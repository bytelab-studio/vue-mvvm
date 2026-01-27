# Router

- [Router](#router)
  - [Configuration](#configuration)
    - [History Strategies](#history-strategies)
    - [RouteAdapter](#routeadapter)
  - [Simple routable ViewModel](#simple-routable-viewmodel)
  - [Complex routable ViewModel](#complex-routable-viewmodel)
  - [Guarded routable ViewModel](#guarded-routable-viewmodel)
  - [Extract RouteAdapter](#extract-routeadapter)
  - [Collect RoutableViews](#collect-routableviews)
  - [Navigation](#navigation)
    - [Navigate to another RouterView](#navigate-to-another-routerview)
    - [Navigate back](#navigate-back)
    - [Accessing route params](#accessing-route-params)
  - [Injected provider](#injected-provider)

The router extension extends the base MVVM capabilities with routing functionality by:

- Defining a `RoutableViewModel` type that associates ViewModels with route paths
- Providing `RouterService` for ViewModel-centric navigation
- Implementing route guards declaratively on ViewModel classes
- Automatically configure `vue-router` during application initialization

## Configuration

The router extension extends `AppShell` interface via TypeScript interface merging to 
add router specific configuration.

| Property  | Type                              | Description                                               |
| --------- | --------------------------------- | --------------------------------------------------------- |
| `history` | `"memory" \| "web" \| "web-hash"` | Router history strategy. Defaults to `web`                |
| `views`   | `RoutableViewModel[]`             | Array of ViewModel constructors with routing information. |

### History Strategies

- `"memory"`: In-memory history for server-side rendering
- `"web"`: HTML5 History API for standard single-page applications
- `"web-hash"`: Hash-based history for environments without server configuration (e.g., `file://` protocol)

### RouteAdapter

The `RouteAdapter` interface defines the contract for exposing routing information on a ViewModel class. This interface is used to declare route paths and optional navigation guards.

```typescript
interface RouteAdapter {
    guard?(): RouteAdapterGuardReturn;
    path: string;
    params?: Record<string, "integer" | "string">;
}
```

## Simple routable ViewModel

To make a ViewModel routable, we need to implement the RouteAdapter in the ViewModel

```typescript
import {Component} from "vue";

// Important 'vue-mvvm/router' not 'vue-mvvm'
import {RouteAdapter} from "vue-mvvm/router";

import DashboardView from "./DashboardView.vue";

export class DashboardViewModel extends ViewModel {
    public static readonly component: Component = DashboardView; 
    public static readonly route: RouteAdapter = {
        path: "/dashboard"
    }
}
```

The path parameter follows the same syntax rules like the `vue-router` package.

## Complex routable ViewModel

```typescript
import {Component} from "vue";

// Important 'vue-mvvm/router' not 'vue-mvvm'
import {RouteAdapter} from "vue-mvvm/router";

import ProductView from "./ProductView.vue";

export class ProductViewModel extends ViewModel {
    public static readonly component: Component = ProductView; 
    public static readonly route = {
        path: "/product/:id",
        params: {
            id: "integer"
        }
    } satisfies RouteAdapter;
}
```

When we want path parameters, we can define them like in `vue-router` package with `:<name>`.

Additionally, we need to define a type signature in the `params` object, which is later inferred when navigating programmatically.

## Guarded routable ViewModel

```typescript
import {Component} from "vue";

// Important 'vue-mvvm/router' not 'vue-mvvm'
import {RouteAdapter, RoutableViewModel} from "vue-mvvm/router";

import DashboardViewModel from "./DashboardView.model";
import AdminView from "./AdminView.vue";

export class AdminViewModel extends ViewModel {
    public static readonly component: Component = AdminView; 
    public static readonly route: RouteAdapter = {
        path: "/admin",
        guard(): true | RoutableViewModel {
            if (true /* any condition */) {
                // redirect to dashboard page
                return DashboardViewModel;
            }

            return true;
        }
    }
}
```

We can define a route guard for access control to this view. The function must either return `true` if it is allowed to navigate to or another RoutableViewModel to redirect to.

Additionally, we can declare the guard function as async and return a Promise as well.

## Extract RouteAdapter

In larger ViewModels it might be useful to extract the `RouteAdapter` out of the class.

This can be done by either defining it as a standalone object above the class or wrapping the `RouteAdapter` in its own class.

```typescript
import {Component} from "vue";

// Important 'vue-mvvm/router' not 'vue-mvvm'
import {RouteAdapter, RoutableViewModel} from "vue-mvvm/router";

import DashboardViewModel from "./DashboardView.model";
import AdminView from "./AdminView.vue";

const AdminRoute: RouteAdapter = {
    path: "/admin",
    guard(): true | RoutableViewModel {
        if (true /* any condition */) {
            // redirect to dashboard page
            return DashboardViewModel;
        }

        return true;
    }
}

export class AdminViewModel extends ViewModel {
    public static readonly component: Component = AdminView; 
    public static readonly route: RouteAdapter = AdminRoute;
}
```

```typescript
import {Component} from "vue";

// Important 'vue-mvvm/router' not 'vue-mvvm'
import {RouteAdapter, RoutableViewModel} from "vue-mvvm/router";

import DashboardViewModel from "./DashboardView.model";
import AdminView from "./AdminView.vue";

class AdminRoute implements RouteAdapter {
    public readonly path: string = "/admin";

    public guard(): true | RoutableViewModel {
        if (true /* any condition */) {
            // redirect to dashboard page
            return DashboardViewModel;
        }

        return true;
    }
}

export class AdminViewModel extends ViewModel {
    public static readonly component: Component = AdminView; 
    public static readonly route: RouteAdapter = new AdminRoute();
}
```

## Collect RoutableViews

To make routing work, we need to collect all views and add them to the list in our `AppShell` configuration.

```typescript
import {DashboardViewModel} from "@views/DashboardView.model";
import {AdminViewModel} from "@views/AdminView.model";

class AppConfig implements AppShell {
    router = {
        views: [
            DashboardViewModel,
            AdminViewModel
        ]
    }
}
```

## Navigation

The `RouterService` allows us to navigate programmatically in our ViewModels.
We can retrieve it from our DI container like any other service.

```typescript
import {RouterService} from "vue-mvvm/router";

export class MainView extends ViewModel {
    private readonly routerService: RouterService;

    public constructor() {
        super();

        this.routerService = this.ctx.getService(RouterService);
    }
}
```

The `RouterService` contains wrapper methods around the `Router` instance of `vue-router`.

### Navigate to another RouterView

Use `navigateTo` to push a new entry onto the history stack and change the current view.

```typescript
// ...
await this.routerService.navigateTo(OtherViewModel);
// ...
```

Before navigation completes, the target ViewModel's guard (if defined) is evaluated. When the guard returns another ViewModel, a redirect occurs.

If the target `RoutableViewModel` contains path params and declares them in the `params` field of its `RouteAdapter`,
TypeScript will enforce a second argument where you must pass the required path parameters.

::: code-group

```typescript [MainView.model.ts]
// ...
await this.routerService.navigateTo(ProductViewModel, {
    id: 123 // <-- must be of type number
});
// ...
```

```typescript [ProductView.model.ts]
export class ProductViewModel extends ViewModel {
    public static readonly component: Component = ProductView; 
    public static readonly route = {
        path: "/product/:id",
        params: {
            id: "integer"
        }
    } satisfies RouteAdapter;
}
```

:::

### Navigate back

Use `navigateBack` to move backward in the browser history stack when possible.

### Accessing route params

You can access the current route parameters from a ViewModel via `RouterService.params`.
Use the strongly typed helpers to validate and coerce values.

```typescript
import {type RouteAdapter, RouterService} from "vue-mvvm/router";

export class ProductViewModel extends ViewModel {
    private readonly router: RouterService;

    public static readonly route = {
        path: "/product/:id",
        params: { id: "integer" }
    } satisfies RouteAdapter;

    public constructor() {
        super();
        this.router = this.ctx.getService(RouterService);
    }

    public mounted(): void {
        const id: number = this.router.params.getInteger("id");
        // use id ...
    }
}
```

## Injected provider

When `vue-mvvm/router` is used, the framework injects a `RouterView` from the `vue-router` package as a provider.
