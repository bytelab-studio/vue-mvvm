# Dependency Injection

- [Dependency Injection](#dependency-injection)
  - [Service registration](#service-registration)
    - [Ways to declare a service](#ways-to-declare-a-service)
    - [Example registration](#example-registration)
  - [Lazy instantiation](#lazy-instantiation)
  - [Service Mocking](#service-mocking)

## Service registration

Services are registered during application initialization through the `AppShell.configureServices` method.
Each service is associated with a constructor key (typically a class) and a factory function that creates
the service instance.

Factory functions receive a ReadableGlobalContext as a parameter, allowing services to depend on other services.

### Ways to declare a service

You can register services in three ways:

1. Using a class constructor and factory function
2. Using a `ServiceKey` and factory function
3. Using an `AsyncServiceKey` and async factory function

:::: code-group

```typescript [1) Class constructor + factory]
export class LoggerService {
  public logMessage(message: string) {
    // ...
  }
}

export class AppConfig implements AppShell {
  public configureServices(ctx: WritableGlobalContext) {
    // Use the class itself as the key
    ctx.registerService(LoggerService, () => new LoggerService());
  }
}
```

```typescript [2) ServiceKey + factory]
import { ServiceKey } from "vue-mvvm";

// For values/services that are not classes, create an explicit key
export const ApiBaseUrl = new ServiceKey<string>("ApiBaseUrl");

export class AppConfig implements AppShell {
  public configureServices(ctx: WritableGlobalContext) {
    ctx.registerService(ApiBaseUrl, () => "https://api.example.com");
  }
}
```

```typescript [3) AsyncServiceKey + async factory]
import { AsyncServiceKey } from "vue-mvvm";

export interface UserProfile { id: string; name: string }
export const CurrentUserProfile = new AsyncServiceKey<UserProfile>("CurrentUserProfile");

export class AppConfig implements AppShell {
  public configureServices(ctx: WritableGlobalContext) {
    ctx.registerService(CurrentUserProfile, async () => {
      const res = await fetch("/api/me");
      if (!res.ok) throw new Error("Failed to load user profile");
      return await res.json() as UserProfile;
    });
  }
}
```

::::

### Example registration

::: code-group

```typescript [Logger.service.ts]
export class LoggerService {
  public logMessage(message: string) {
    // Implementation ...
  }
}
```

```typescript [config.ts]
import {LoggerService} from "@services/logger.service";

export class AppConfig implements AppShell {
  public configureServices(ctx: WritableGlobalContext) {
    ctx.registerService(LoggerService, () => new LoggerService());
  }
}
```

:::

A service can only be registered once with the same key.

## Lazy instantiation

Services are retrieved using `getService` method, which is implements lazy
instantiation with singelton semantics.

The `getService` function follows these steps:

1. **Check instance cache:** First checks for an existing instance.
2. **Lookup factory:** If no instance exists, retrives the factory function.
3. **Instantiate:** Calls the factory function with a `ReadableGlobalContext` to create the instance
4. **Validate:** Throws `InvalidServiceInstanceError` if the factory returns a falsy value
5. **Cache:** Stores the instance in the cache

This lazy instantiation pattern ensures services are only created when first
requested, improving application startup performance.

## Service Mocking

The `mockService` method enables replacing service implementations with test doubles, facilitating
unit testing of ViewModels without real service dependencies.

```typescript
import {LoggerService} from "@services/logger.service";
import {LoggerServiceMock} from "@mocks/logger.service";

export class AppConfig implements AppShell {
  public configureServices(ctx: WritableGlobalContext) {
    ctx.registerService(LoggerService, () => new LoggerService());

    if (import.meta.env.VITE_TEST) {
      ctx.mockService(LoggerService, () => new LoggerServiceMock());
    }
  }
}
```
