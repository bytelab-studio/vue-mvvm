# Syncio

- [Syncio](#syncio)
    - [Overview](#overview)
    - [API Reference](#api-reference)
    - [Why Syncio?](#why-syncio)

Syncio is a utility module for handling potentially asynchronous operations in a uniform way.

## Overview

In the framework, many methods (like lifecycle hooks or actions) can return either a plain value (synchronously) or a
`Promise` (asynchronously). Syncio provides a single entry point to ensure these are handled correctly without
duplicating `if (val instanceof Promise)` logic everywhere.

## API Reference

### `ensureSync<T>(val: T | Promise<T>): Promise<Awaited<T>>`

Ensures that a value is awaited if it is a `Promise`.

- `val`: The value or promise to be awaited.
- **Returns:** A `Promise` that resolves to the actual value of type `T`.

## Why Syncio?

Vue doesn't always await its lifecycle hooks, but sometimes the framework or user needs to ensure certain cleanup or
coordination happens.

Syncio is used internally for:

- **Action Execution:** Awaiting `onAction` results in `ViewModel.runAction`.
- **Delegates:** Awaiting each subscriber during a `SEQUENTIAL` invoke or all subscribers during a `PARALLEL` invoke.
- **Router Guards:** Awaiting `RouteAdapter.guard` results.
- **Lifecycle Management:** Awaiting `unmounted` hooks in `useViewModelInstance`.

By using `ensureSync`, the framework can support both synchronous and asynchronous user code with minimal overhead.

```typescript
import {syncio} from 'vue-mvvm';

async function process(something: string | Promise<string>) {
    // We don't care if it's a promise or a string, we just want the value.
    const val = await syncio.ensureSync(something);
    console.log(val);
}
```
