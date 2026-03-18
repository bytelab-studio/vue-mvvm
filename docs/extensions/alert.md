# Alert Extension

- [Alert Extension](#alert-extension)
    - [Overview](#overview)
    - [Configuration](#configuration)
    - [Implementing Alert/Confirm Controls](#implementing-alertconfirm-controls)
    - [Using the Alert Service](#using-the-alert-service)
    - [Extending Options](#extending-options)

The Alert extension provides a unified way to display common dialogs like alerts and confirmations across your
application, using custom UI components but a standardized API.

## Overview

While the [Dialog Extension](./dialog) is for general-purpose modals, the Alert extension is specifically for:

- **Alerts:** Informational messages that the user acknowledges (returns `void`).
- **Confirmations:** Questions that the user answers with yes/no (returns `boolean`).

It allows you to define the UI for these dialogs once in your configuration and then trigger them from any ViewModel
using the `AlertService`.

## Configuration

You must register your custom Alert and Confirm components in the `AppShell`.

```typescript
// config.ts
import {MyAlertControl} from './controls/MyAlertControl.model';
import {MyConfirmControl} from './controls/MyConfirmControl.model';

export class AppConfig implements AppShell {
    public alert: AppShell.AlertConfig = {
        alert: MyAlertControl,
        confirm: MyConfirmControl
    }

    public configureServices(ctx: WritableGlobalContext) {
        // ...
    }
}
```

## Implementing Alert/Confirm Controls

Your components must extend `AlertControl` or `ConfirmControl`. These base classes already implement the basic logic and
expose `title` and `description` as reactive properties.

```typescript
// MyAlertControl.model.ts
import {AlertControl, AlertOptions} from 'vue-mvvm/alert';
import MyAlertView from './MyAlertView.vue';

export class MyAlertControl extends AlertControl {
    public static readonly component = MyAlertView;

    public onAction(ctx: ActionContext<void>) {
        this.actionContext = ctx;
    }

    protected onOpen() { /* ... */
    }

    protected onClose() { /* ... */
    }

    public onOk() {
        this.actionContext?.completeAction();
    }
}
```

## Using the Alert Service

Inject the `AlertService` into your ViewModel to show alerts or confirmations.

```typescript
export class MyViewModel extends ViewModel {
    private alertService: AlertService;

    constructor() {
        super();
        this.alertService = this.ctx.getService(AlertService);
    }

    public async deleteItem() {
        const confirmed = await this.alertService.showConfirm({
            title: "Delete Item",
            description: "Are you sure you want to delete this item?"
        });

        if (confirmed) {
            // Proceed with deletion
            await this.alertService.showAlert({
                title: "Success",
                description: "Item deleted successfully."
            });
        }
    }
}
```

## Extending Options

The `AlertOptions` and `ConfirmOptions` interfaces can be extended through TypeScript's interface merging feature. This
allows you to pass additional data to your custom alert and confirm components.

```typescript
// types.d.ts or in your control file
import 'vue-mvvm/alert';

declare module 'vue-mvvm/alert' {
    export interface AlertOptions {
        severity?: 'info' | 'warning' | 'error';
    }

    export interface ConfirmOptions {
        confirmText?: string;
        cancelText?: string;
    }
}
```

Once extended, you can use these properties in your ViewModels:

```typescript
await this.alertService.showAlert({
    title: "Critical Error",
    description: "An unexpected error occurred.",
    severity: "error" // Now type-checked
});
```

And access them in your custom AlertControl:

```typescript
export class MyAlertControl extends AlertControl {
    public readonly severity = this.computed(() => this.options.severity ?? 'info');
    // ...
}
```

::: warning
Use interface merging with caution. Modifying global interfaces can lead to naming collisions and unexpected behavior, especially in large projects or when multiple libraries try to extend the same interfaces.

**Libraries should avoid interface merging** as it could break the global TypeScript type-checker for the consuming application. 

If you must use it, always define added properties as **optional** to ensure compatibility with existing code that may not provide those properties.
:::
