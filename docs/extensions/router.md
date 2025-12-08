# Router

- [Router](#router)
  - [Configuration](#configuration)
    - [History Strategies](#history-strategies)
    - [RouteAdapter](#routeadapter)
  - [Simple routeable ViewModel](#simple-routeable-viewmodel)
  - [Complex routeable ViewModel](#complex-routeable-viewmodel)
  - [Guarded routable ViewModel](#guarded-routable-viewmodel)
  - [Extract RouteAdapter](#extract-routeadapter)
  - [Collect RoutableViews](#collect-routableviews)
  - [Navigation](#navigation)
    - [Navigate to another RouterView](#navigate-to-another-routerview)
    - [Navigate back](#navigate-back)
  - [Injected provider](#injected-provider)

The router extension extends the base MVVM capabilities with routing functionality by:

- Defining a `RoutableViewModel` type that associates ViewModels with route paths
- Providing `RouterSerivce` for ViewModel-centric navigation
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

## Simple routeable ViewModel

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

## Complex routeable ViewModel

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

Additonally we need to define a type signature in the params object, which is later infered when navigating programatically.

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
            if (/* Any kind of condition */) {
                // redirect to dashboard page
                return DashboardViewModel;
            }

            return true;
        }
    }
}
```

We can define a route guard for access control to this view. The function must either return `true` if it is allowed to navigate to or another RoutableViewModel to redirect to.

Additonally, we can declare the guard function as async and return a promise like version.

## Extract RouteAdapter

In larger ViewModels it might be usefull to extract the RouteAdapter out of the class.

This can be done by either defining it as a global object above the class or wrapping the RouteAdapter in their own classes.

```typescript
import {Component} from "vue";

// Important 'vue-mvvm/router' not 'vue-mvvm'
import {RouteAdapter, RoutableViewModel} from "vue-mvvm/router";

import DashboardViewModel from "./DashboardView.model";
import AdminView from "./AdminView.vue";

const AdminRoute: RouteAdapter = {
    path: "/admin",
    guard(): true | RoutableViewModel {
        if (/* Any kind of condition */) {
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
    path: "/admin",
    guard(): true | RoutableViewModel {
        if (/* Any kind of condition */) {
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

To make the routing actual work, we need to collect all views and add them to the list in our `AppShell` configuration.

```typescript
import {DashboardViewModel} from "@views/DashboardView.model";
import {AdminViewModel} from "@views/AdminView.model";

class AppConfig implements AppShell {
    router = {
        views = [
            DashboardViewModel,
            AdminViewModel
        ];
    }
}
```

## Navigation

The RouterService allows us to navigate programmatically in our ViewModels.
We can retrive it from our DI Container like any other Service.

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

The RouterService contains wrapper methods around the `Router` instance of `vue-router`.

### Navigate to another RouterView

We can use the `navigateTo` method, to change the current view.

```typescript
// ...
await this.routerService.navigateTo(OtherViewModel);
// ...
```

This will first call the guard, if exist, of the targeting ViewModel, before changing the page.

If the RoutableViewModel contains path params and has them defined in the `params` field of the `RouteAdapter`.
TypeScript will enforce a second parameter where we need to pass the path parameters.

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

We can use the `navigateBack`, to navigate backwards, if possible, in the browser history stack.

## Injected provider

When `vue-mvvm/router` is used the framwork injects a `RouterView` from the `vue-router` package as provider.
