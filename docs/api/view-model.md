# ViewModel

- [ViewModel](#viewmodel)
    - [Lifecycle Hooks](#lifecycle-hooks)
        - [Asynchronous Lifecycle Methods](#asynchronous-lifecycle-methods)
    - [Reactivity](#reactivity)
        - [Vue's reactivity vs. ViewModel wrappers](#vues-reactivity-vs-viewmodel-wrappers)
    - [Accessing GlobalContext](#accessing-globalcontext)

ViewModels are the core abstraction in the `vue-mvvm` framework, serving as the intermediary
layer between Vue components (Views) and business logic (Services).

A ViewModel encapsulates presentation logic, manages UI state, coordinates with services
through dependency injection, declares lifecycle hooks that mirror Vue's component
lifecycle, and provides wrapper methods for Vue's reactivity functions.

## Lifecycle Hooks

The `ViewModel` class provides the following lifecycle methods, each corresponding
to a specific Vue component lifecycle stage:

| ViewModel Methods | Vue Hook          | Timing                                          |
|-------------------|-------------------|-------------------------------------------------|
| `beforeMount`     | `onBeforeMount`   | Before component is mounted to the DOM          |
| `mounted`         | `onMounted`       | After components is mounted to DOM              |
| `beforeUpdate`    | `onBeforeUpdate`  | Before reactive state changes trigger re-render |
| `updated`         | `onUpdated`       | After reactive state changes and DOM updates    |
| `beforeUnmount`   | `onBeforeUnmount` | Before component is unmounted                   |
| `unmounted`       | `onUnmounted`     | After component is unmounted                    |
| `activated`       | `onActivated`     | When keep-alive component is activated          |
| `deactivated`     | `onDeactivated`   | When keep-alive component is deactivated        |

### Asynchronous Lifecycle Methods

All lifecycle methods can return either `void` or `Promise<void>`. While asynchronous
lifecycle methods are supported, Vue does not await for them to complete before proceeding
with the component lifecycle. If you need to ensure asynchronous operations complete
before certain UI interactions are enabled, consider using a loading state variable.

## Reactivity

The ViewModel class provides protected methods for creating reactive properties.
For a detailed explanation of the reactivity system, see the [Reactivity](./reactivity) documentation.

These methods enable you to declare reactive properties as class fields, which are then
automatically transformed into Vue reactivity references through a proxy reactivity system.

### Vue's reactivity vs. ViewModel wrappers

Regardless of whether you use Vue's reactivity or the ViewModel wrappers, the result will be the same.
The goal of the ViewModel wrappers is to achieve a better developer experience (DX).

With standard Vue's reactivity, a counter would look like this:

```typescript
export class CounterViewModel extends ViewModel {
    public count: Ref<number> = ref(0);

    public increment(): void {
        this.count.value++;
    }
}
```

```vue

<template>
    <h1>Count {{ vm.count.value }}</h1>
    <button @click="vm.increment">Increment</button>
</template>

<script setup lang="ts">
    const vm = useViewModel(CounterViewModel);
</script>
```

We can modify this sample to use the ViewModel wrappers

```typescript
export class CounterViewModel extends ViewModel {
    public count: Ref<number> = ref(0); // [!code --]
    public count: number = this.ref(0); // [!code ++]

    public increment(): void {
        this.count.value++; // [!code --]
        this.count++ // [!code ++]
    }
}
```

```vue

<template>
    <h1>Count {{ vm.count.value }}</h1> <!-- [!code --] -->
    <h1>Count {{ vm.count }}</h1> <!-- [!code ++] -->
    <button @click="vm.increment">Increment</button>
</template>

<script setup lang="ts">
    const vm = useViewModel(CounterViewModel);
</script>
```

When creating reactive properties through the wrapper method, we don't need to call `.value` anymore.

The same can be achived for computed properties:

```typescript
export class CounterViewModel extends ViewModel {
    public count: number = this.ref(0);
    public doubleCount: number = this.computed(() => this.count * 2); // [!code ++]

    public increment(): void {
        this.count++;
    }
}
```

```vue

<template>
    <h1>Count {{ vm.count }}</h1>
    <h2>DoubleCount {{ vm.doubleCount }}</h2> <!-- [!code ++] -->
    <button @click="vm.increment">Increment</button>
</template>

<script setup lang="ts">
    const vm = useViewModel(CounterViewModel);
</script>
```

## Accessing GlobalContext

Every ViewModel instance has access to a protected, readonly field called `ctx` of type `ReadableGlobalContext`.

The method `getService` retrieves service instances from the global dependency injection container.
It accepts a service class constructor, a `ServiceKey` or an `AsyncServiceKey` as its parameter and returns a
fully-typed instance of that service.

```typescript
import {FooService} from "@services/foo.service";

export class MyViewModel extends ViewModel {
    private readonly fooService: FooService;

    public constructor() {
        super();

        this.fooService = this.ctx.getService(FooService);
    }
}
```
