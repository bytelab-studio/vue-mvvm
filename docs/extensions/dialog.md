# Dialog Extension

- [Dialog Extension](#dialog-extension)
    - [Overview](#overview)
    - [Architecture](#architecture)
    - [Implementing a Dialog](#implementing-a-dialog)
        - [1. Create Dialog ViewModel](#1-create-dialog-viewmodel)
        - [2. Create Dialog View](#2-create-dialog-view)
    - [Using Dialogs](#using-dialogs)
        - [Disposal Pattern](#disposal-pattern)
        - [Parameter Forwarding](#parameter-forwarding)
    - [Action Pattern with Dialogs](#action-pattern-with-dialogs)

The Dialog extension provides a declarative and type-safe way to manage dialogs and modals from your ViewModels.

## Overview

Unlike traditional Vue approaches where dialogs are often controlled by boolean props in templates, `vue-mvvm/dialog`
allows you to instantiate and control dialogs directly from your ViewModels or Services using the `DialogService`.

## Architecture

- **`DialogControl`:** A specialized `UserControl` that adds lifecycle methods specifically for dialogs (`onOpen`,
  `onClose`) and a `destroy` method to remove it from the DOM.
- **`DialogService`:** A service to instantiate (`initDialog`) new dialog instances.
- **`DialogProvider`:** A component that automatically renders all active dialog instances. It is automatically
  registered when using the extension and rendered when using `MVVMApp`.

## Implementing a Dialog

### 1. Create Dialog ViewModel

A dialog's ViewModel must extend `DialogControl` and provide a static `component` property.

```typescript
// MyDialog.model.ts
import {DialogControl} from 'vue-mvvm/dialog';
import MyDialogView from './MyDialog.vue';

export class MyDialogModel extends DialogControl {
    public static readonly component = MyDialogView;

    public message: string = this.ref("");
    public isOpen: boolean = this.ref(false);

    constructor(message: string) {
        super();
        this.message = message;
    }

    protected onOpen() {
        this.isOpen = true;
    }

    protected onClose() {
        this.isOpen = false;
        this.destroy(); // Optional: remove from DOM after closing
    }
}
```

### 2. Create Dialog View

The View is a standard Vue component that uses `useDialogControl` to bind to its ViewModel.

```vue
<!-- MyDialog.vue -->
<template>
    <div v-if="vm.isOpen" class="modal">
        <p>{{ vm.message }}</p>
        <button @click="vm.closeDialog">Close</button>
    </div>
</template>

<script setup lang="ts">
    import {useDialogControl} from 'vue-mvvm/dialog';
    import {MyDialogModel} from './MyDialog.model';

    const vm = useDialogControl(MyDialogModel);
</script>
```

## Using Dialogs

To open a dialog from another ViewModel, use the `DialogService`.

```typescript
export class MainViewModel extends ViewModel {
    private dialogService: DialogService;

    constructor() {
        super();
        this.dialogService = this.ctx.getService(DialogService);
    }

    public async showInfo() {
        // 1. Initialize (instantiate)
        const dialog = this.dialogService.initDialog(MyDialogModel, "Hello from VM!");

        // 2. Open
        await dialog.openDialog();
    }

    public async showAndForget() {
        // The Disposal pattern ensures that the dialog is destroyed when it is no longer needed.
        using dialog = this.dialogService.initDialog(MyDialogModel, "Disposable Dialog");
        await dialog.openDialog();

        // Perform some logic...
        // When showAndForget finishes, dialog.destroy() is called automatically.
    }
}
```

### Disposal Pattern

`DialogControl` implements the `Disposable` interface. This allows you to use the `using` keyword (introduced in
TypeScript 5.2) to automatically call `destroy()` when the scope is exited.

```typescript
class VM extends ViewModel {
    public async deleteItem() {
        using dialog = this.dialogService.initDialog(ConfirmDeleteDialog);
        await dialog.openDialog();

        const result = await this.runAction(dialog);
        if (result.success) {
            // perform delete...
        }
        // dialog.destroy() is called automatically here
    }
}
```

::: warning
When using the disposal pattern, be careful when only calling `openDialog()` without awaiting a result from an action or
blocking the method otherwise.

In the following example, the dialog will be immediately closed (destroyed) because the method exits right after
`openDialog()` resolves, triggering the disposal:

```typescript
class VM extends ViewModel {
    public async openDialog() {
        using dialog = this.dialogService.initDialog(MyDialog);
        await dialog.openDialog();
    }
}
```

To keep the dialog open, either don't use the `using` keyword or await an action result using `runAction(dialog)` or 
block the method manually.
:::

### Parameter Forwarding

The `initDialog` method is fully type-safe and forwards all arguments to the constructor of the ViewModel.

```typescript
// Dialog ViewModel constructor
class Dialog extends DialogControl {
    constructor(title: string, count: number) {
        super();
        // ...
    }
}


// Service call
this.dialogService.initDialog(MyDialogModel, "Title", 42); // Type-checked arguments
```

## Action Pattern with Dialogs

Since `DialogControl` extends `UserControl`, it works perfectly with the [Action Pattern](./api/action). You can `await`
a result from a dialog:

```typescript
// In MainViewModel
const dialog = this.dialogService.initDialog(PromptDialog, "Are you sure?");
await dialog.openDialog();

const result = await this.runAction(dialog);
if (result.success) {
    // User confirmed
}
```
