# Dependency Injection

- [Dependency Injection](#dependency-injection)
  - [Service registration](#service-registration)
    - [Example registration](#example-registration)
  - [Lazy instantiation](#lazy-instantiation)
  - [Service Mocking](#service-mocking)

## Service registration

Services are registered during application initalization through the `AppShell.configureServices` method.
Each service is associated with a constructor key (typically a class) and a factory function that creates
the service instance.

Factory functions recieve a ReadableGlobalContext as a parameter, allowing services to depend on other services.

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
