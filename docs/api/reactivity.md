# Reactivity

- [Reactivity](#reactivity)
    - [Overview](#overview)
    - [Reactive System (`reactive`)](#reactive-system-reactivets)
        - [Markers](#markers)
        - [`applyReactivity`](#applyreactivity)
    - [ViewModel Reactive Wrapper](#viewmodel-reactive-wrapper)
        - [`this.ref`](#thisref)
        - [`this.computed`](#thiscomputed)
        - [`this.readonly`](#thisreadonly)
    - [Key Differences from Standard Vue](#key-differences-from-standard-vue)

The framework provides a unique reactivity system built on top of Vue's reactivity, enabling a clean, class-based
developer experience without the need for `.value` in most cases.

## Overview

The reactivity system consists of two main parts:

1. **Reactivity Markers:** Functions like `ref` and `computed` that return lightweight markers during class
   initialization.
2. **Proxy Wrapper:** The `applyReactivity` function (automatically called by the `ViewModel` constructor) that replaces
   these markers with actual Vue reactivity and handles property access.

## Reactive System

The `reactive` module defines how reactive fields are declared and processed.

### Markers

Markers are temporary objects that tell the proxy how to initialize the reactive property.

| Function                   | Returns          | Purpose                               |
|----------------------------|------------------|---------------------------------------|
| `ref(initial)`             | `RefMarker`      | Represents a reactive value.          |
| `computed(getter/options)` | `ComputedMarker` | Represents a reactive computed value. |

### `applyReactivity`

This is the core of the system. It wraps the ViewModel instance in a Proxy.

- **Initialization:** When a property marked with a `RefMarker` or `ComputedMarker` is first accessed, the proxy creates
  the corresponding Vue `ref` or `computed` and caches it.
- **Getter:** Automatically returns the `.value` of the underlying Vue reference.
- **Setter:** Automatically updates the `.value` of the underlying Vue reference.

This allows you to write `this.count++` instead of `this.count.value++`.

## ViewModel Reactive Wrapper

The `ViewModel` class provides protected helper methods that use these markers.

### `this.ref`

Creates a reactive property from an initial value.

```typescript
export class Counter extends ViewModel {
    public count: number = this.ref(0);

    public increment() {
        this.count++;
    }
}
```

### `this.computed`

Creates a reactive computed property.

```typescript
export class Counter extends ViewModel {
    public count: number = this.ref(0);
    public doubleCount: number = this.computed(() => this.count * 2);
}
```

### `this.readonly`

Creates a read-only runtime protected reactive property.

```typescript
export class Counter extends ViewModel {
    // It makes sense to declare the property as readonly in typescript as-well
    public readonly name: string;
    
    public constructor(name: string) {
        super();
        
        this.name = this.readonly(name);
    }
}
```

## Key Differences from Standard Vue

1. **No `.value`:** Inside the ViewModel (and in the template), you access reactive properties directly.
2. **Class Fields:** You must declare reactive properties as class fields assigned to the marker functions.
3. **Proxy-based:** Access is intercepted via a Proxy, so standard object operations work as expected on the reactive
   properties.
4. **Late Initialization:** Reactive Vue objects are only created upon first access to the property.
