# Toast Extension

- [Toast Extension](#toast-extension)
    - [Overview](#overview)
    - [Configuration](#configuration)
    - [Implementing Toast Controls](#implementing-toast-controls)
    - [Using the Toast Service](#using-the-toast-service)
    - [Progress Toasts](#progress-toasts)
    - [Custom Toasts](#custom-toasts)
    - [Extending Options](#extending-options)

The Toast extension provides a unified way to display ephemeral notifications like alerts, warnings, and progress indicators across your application.

## Overview

Toasts are short-lived messages that appear on the screen and then disappear after a set amount of time or when an operation completes. The Toast extension supports:

- **Info Toasts:** Informational messages, warnings, or errors that automatically disappear.
- **Progress Toasts:** Messages that include a progress indicator, useful for long-running tasks.
- **Custom Toasts:** You can create your own toast types by extending the base `ToastControl`.

## Configuration

You must register your toast components and a container component in the `AppShell`.

```typescript
// config.ts
import {MyInfoToast} from './controls/MyInfoToast.model';
import {MyProgressToast} from './controls/MyProgressToast.model';
import MyToastContainer from './controls/MyToastContainer.vue';

export class AppConfig implements AppShell {
    public toast: AppShell.ToastConfig = {
        info: MyInfoToast,
        progress: MyProgressToast,
        container: MyToastContainer
    }

    public configureServices(ctx: WritableGlobalContext) {
        // ...
    }
}
```

The `container` component is responsible for positioning and animating the toasts on the screen. It will receive all active toasts via its **default slot**.

## Implementing Toast Controls

Your toast components should extend `InfoToastControl`, `ProgressToastControl`, or the base `ToastControl`. These classes provide reactive properties for title, description, and type.

### Info Toast

An `InfoToastControl` automatically destroys itself after a duration (default is 5000ms).

```typescript
// MyInfoToast.model.ts
import {InfoToastControl} from 'vue-mvvm/toast';
import MyInfoToastView from './MyInfoToastView.vue';

export class MyInfoToast extends InfoToastControl {
    public static readonly component = MyInfoToastView;
}
```

### Progress Toast

A `ProgressToastControl` provides a `value` property and a `percentage` computed property. It can also be indeterminate.

```typescript
// MyProgressToast.model.ts
import {ProgressToastControl} from 'vue-mvvm/toast';
import MyProgressToastView from './MyProgressToastView.vue';

export class MyProgressToast extends ProgressToastControl {
    public static readonly component = MyProgressToastView;
}
```

## Using the Toast Service

Inject the `ToastService` into your ViewModel to show toasts.

```typescript
import {ViewModel} from 'vue-mvvm';
import {ToastService} from 'vue-mvvm/toast';

export class MyViewModel extends ViewModel {
    private toastService: ToastService;

    constructor() {
        super();
        this.toastService = this.ctx.getService(ToastService);
    }

    public async showMessage() {
        await this.toastService.showInfo({
            type: "info",
            title: "Hello",
            description: "This is a toast message!"
        });
    }
}
```

## Progress Toasts

Progress toasts are particularly useful for tracking background tasks. You can use the `using` statement or manually call `destroyAfter()` when the task is finished.

```typescript
public async runTask() {
    const toast = await this.toastService.showProgress({
        type: "info",
        title: "Uploading",
        description: "Uploading file...",
        max: 100
    });

    try {
        for (let i = 0; i <= 100; i += 10) {
            toast.value = i;
            await new Promise(r => setTimeout(r, 500));
        }
    } finally {
        // Automatically hide the toast after a few seconds
        toast.destroyAfter(2000);
    }
}
```

You can use `using` keyword (introduced in TypeScript 5.2) to automatically schedule destruction.

```typescript
public async runTask() {
    using toast = await this.toastService.showProgress({
        type: "info",
        title: "Processing",
        description: "Please wait...",
        max: 100
    });

    // Toast will call destroyAfter() automatically when the block is exited
    // ... logic ...
    toast.value = 50;
    // ... logic ...
}
```

The default timeout for `using` is 5000ms. If you need to overwrite this duration, you can call `destroyAfter(ms)` manually before the `using` scope ends.

```typescript
public async runTask() {
    using toast = await this.toastService.showProgress({
        type: "info",
        title: "Processing",
        description: "Please wait...",
        max: 100
    });

    // Toast will call destroyAfter() automatically when the block is exited
    // ... logic ...
    toast.value = 50;
    // ... logic ...
    toast.destroyAfter(3000); // Toast will be destroyed after 3sec and not 5sec.
}
```

::: warning
When using the disposal pattern, be careful when only showing a toast without awaiting a result or blocking the method otherwise.

The toast might be immediately closed (destroyed) because the method exits right after the toast is shown, triggering the disposal:

```typescript
public async runTask() {
    using toast = await this.toastService.showProgress({ /* ... */ });
    // If no logic follows, the toast is destroyed immediately after 5sec
}
```

or in a extrem version:

```typescript
public async runTask() {
    using toast = await this.toastService.showProgress({ /* ... */ });
    toast.destroyAfter(0); 
    // Will destroy the toast is destroyed immediately
}
```
:::

## Custom Toasts

You can create your own toast types by extending the base `ToastControl` class. This is useful when you need completely custom behavior or UI that doesn't fit into the `info` or `progress` categories.

### 1. Implementing a Custom Toast

A custom toast's ViewModel must extend `ToastControl` and provide a static `component` property pointing to its Vue component.

```typescript
// MyCustomToast.model.ts
import {ToastControl, ToastOptions} from 'vue-mvvm/toast';
import MyCustomToastView from './MyCustomToastView.vue';

export interface MyCustomOptions extends ToastOptions {
    customValue: string;
}

export class MyCustomToast extends ToastControl<MyCustomOptions> {
    public static readonly component = MyCustomToastView;

    public readonly customValue = this.computed(() => this.options.customValue);
    public readonly extraArg = this.ref("");

    constructor(options: MyCustomOptions, extraArg: string) {
        super(options);
        this.extraArg = extraArg;
    }
    
    // Custom toasts don't have automatic destruction like InfoToastControl.
    // You should handle its lifecycle yourself.
    protected mounted() {
        // Example: Destroy after 10 seconds
        setTimeout(() => this.destroy(), 10000);
    }
}
```

### 2. Using a Custom Toast

To show a custom toast, use the `initToast` method of the `ToastService`. This method is fully type-safe and forwards all constructor arguments to the toast instance.

```typescript
import {ViewModel} from 'vue-mvvm';
import {ToastService} from 'vue-mvvm/toast';
import {MyCustomToast} from './MyCustomToast.model';

export class MyViewModel extends ViewModel {
    private toastService: ToastService;

    constructor() {
        super();
        this.toastService = this.ctx.getService(ToastService);
    }

    public async showCustom() {
        const toast = await this.toastService.initToast(
            MyCustomToast, 
            {
                type: "custom",
                title: "Custom Toast",
                description: "This is a custom toast implementation",
                customValue: "Extra Data"
            },
            "Forwarded Argument" // This is passed to the MyCustomToast constructor
        );
        
        // toast is an instance of MyCustomToast
    }
}
```

::: info
Unlike `InfoToastControl`, the base `ToastControl` does not include any logic for automatic destruction. 

If you extend `ToastControl` directly for your custom toasts, you must:
1. Call `this.destroy()` manually within your implementation (e.g., using `setTimeout` in `mounted()`).
2. Or call `toast.destroy()` from the outside when the toast is no longer needed.
:::

## Extending Options

The `ToastOptions`, `InfoToastOptions`, and `ProgressToastOptions` interfaces can be extended through TypeScript's interface merging feature. This allows you to pass additional data to your custom toast components.

```typescript
// types.d.ts or in your control file
import 'vue-mvvm/toast';

declare module 'vue-mvvm/toast' {
    export interface ToastOptions {
        icon?: string;
    }

    export interface InfoToastOptions {
        dismissible?: boolean;
    }
}
```

Once extended, you can use these properties in your ViewModels:

```typescript
await this.toastService.showInfo({
    title: "Notification",
    description: "Something happened!",
    type: "info",
    icon: "check-circle", // Now type-checked
    dismissible: true
});
```

And access them in your custom ToastControl:

```typescript
export class MyInfoToast extends InfoToastControl {
    public readonly icon = this.computed(() => this.options.icon);
    public readonly isDismissible = this.computed(() => this.options.dismissible ?? false);
    // ...
}
```

::: warning
Use interface merging with caution. Modifying global interfaces can lead to naming collisions and unexpected behavior, especially in large projects or when multiple libraries try to extend the same interfaces.

**Libraries should avoid interface merging** as it could break the global TypeScript type-checker for the consuming application. 

If you must use it, always define added properties as **optional** to ensure compatibility with existing code that may not provide those properties.
:::
