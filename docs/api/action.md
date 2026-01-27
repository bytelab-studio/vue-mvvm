# Action

- [Action](#action)
  - [Implementing Actions](#implementing-actions)
    - [Step 1: Implement Action interface](#step-1-implement-action-interface)
    - [Step 2: Handling User Interaction](#step-2-handling-user-interaction)
    - [Step 3: Run Action](#step-3-run-action)
  - [Multiple Execution Contexts](#multiple-execution-contexts)
    - [First call wins](#first-call-wins)
    - [Last call wins](#last-call-wins)
    - [Collect actions](#collect-actions)

The Action pattern enables ViewModels to delegate interactive
tasks to child components and await their results.

This decouples ViewModels from the UI implementation details of user interactions.

| Use Case             | Description                                             |
| -------------------- | ------------------------------------------------------- |
| Form Submission      | Collect and validate user input                         |
| Modal Dialogs        | Present choices and await user decisions                |
| Confirmation Prompts | Request user confirmation before actions (e.g., deletion) |

The `Action<T>` interface defines the contract for components that execute 
user-initiated operations:

```typescript
interface Action<T> {
    onAction(ctx: ActionContext<T>): void | Promise<void>;
}
```

Implementations typically store the `ActionContext` reference to resolve it later when
the user interaction completes (via form submission, dialog button click, etc.).

The `ActionContext<T>` class allows Action implementations to resolve with success or failure.
It enforces single-resolution semantics to prevent race conditions.

The `ActionResult<T>` discriminated union type represents the outcome of an action.

## Implementing Actions

### Step 1: Implement the Action interface

```typescript
interface LoginData {
    username: string;
    password: string;
    keepLoggedIn: boolean;
}

export class MyFormControlModel extends UserControl implements Action<LoginData> {
    private actionContext: ActionContext<LoginData> | null = null;

    public onAction(ctx: ActionContext<LoginData>): void {
        this.actionContext = ctx;
    
        // optionally reset form state, focus first input, etc.
    }


}
```

### Step 2: Handling User Interaction

::: code-group

```typescript [MyFormControl.model.ts]
interface LoginData {
    username: string;
    password: string;
    keepLoggedIn: boolean;
}

export class MyFormControlModel extends UserControl implements Action<LoginData> {
    private actionContext: ActionContext<LoginData> | null = null;

    public username: string = this.ref("");                         // [!code ++]
    public password: string = this.ref("");                         // [!code ++]
    public keepLoggedIn: string = this.ref(false);                  // [!code ++]


    public onAction(ctx: ActionContext<LoginData>): void {
        this.actionContext = ctx;
    
        // optionally reset form state, focus first input, etc.
    }

    public onSubmit() {                                             // [!code ++]
        if (!this.actionContext) {                                  // [!code ++]
            return;                                                 // [!code ++]
        }                                                           // [!code ++]
        // optionally validate data                                  // [!code ++]
        this.actionContext.completeAction({                         // [!code ++]
            username: this.username,                                // [!code ++]
            password: this.password,                                // [!code ++]
            keepLoggedIn: this.keepLoggedIn                         // [!code ++]
        });                                                         // [!code ++]
    }                                                               // [!code ++]

    public onCancel() {                                             // [!code ++]
        if (!this.actionContext) {                                  // [!code ++]
            return;                                                 // [!code ++]
        }                                                           // [!code ++]
        this.actionContext.failAction(new Error("User cancelled")); // [!code ++]
    }                                                               // [!code ++]
}
```

```vue [MyFormControl.vue]
<template>
  <form @submit.prevent="vm.onSubmit">
    <!-- form fields -->
    <button type="submit">Submit</button>
    <button type="button" @click="vm.onCancel">Cancel</button>
  </form>
</template>

<script setup lang="ts">
const vm = useUserControl(MyFormControlModel);
</script>
```

:::

### Step 3: Run Action

::: code-group

```typescript [MainView.model.ts]
class MainViewModel extends ViewModel {
    private readonly myFormControl: MyFormControlModel | null = this.getUserControl("myFormControl");

    public async onLoginBtn(): Promise<void> {
        if (!myFormControl) {
            return;
        }

        const result: ActionResult<LoginData> = await this.runAction(this.myFormControl);
        if (result.success) {
            // perform login request
            return;
        }

        // perform error handling
    }
}
```

```vue [MainView.vue]
<template>
    <MyFormControl ref="myFormControl" />
    <button @click="vm.onLoginBtn">
        Start login
    </button>
</template>

<script setup lang="ts">
const vm = useViewModel(MainViewModel);
</script>
```

:::

::: info
It is also possible to implement the Action interface on a class or object that neither is a UserControl or a ViewModel.

For example it can be used to collect multiple API request of the same route and resolve all at once, 
so that in the end only one http-request was actually made.
:::

## Multiple Execution Contexts

Each `runAction` call creates a fresh `ActionContext`. Important is that the Action implementation
decides how to handle multiple contexts.

Mostly one of the following three implementations will be used.

### First call wins

```typescript
export class MyFormControlModel extends UserControl implements Action<LoginData> {
    private actionContext: ActionContext | null = null;

    public onAction(ctx: ActionContext) {
        if (this.actionContext) {
            ctx.failAction("Action already running");
            return;
        }

        this.actionContext = ctx;
    }
}
```

We reject all incoming actions until the current action is completed.

### Last call wins

```typescript
export class MyFormControlModel extends UserControl implements Action<LoginData> {
    private actionContext: ActionContext | null = null;

    public onAction(ctx: ActionContext) {
        if (this.actionContext) {
            this.actionContext.failAction("Action was canceled do to a second action incoming");
        }

        this.actionContext = ctx;
    }
}
```

We reject the current running action when a new action request occours

### Collect actions

```typescript
export class MyFormControlModel extends UserControl implements Action<LoginData> {
    private actionContexts: ActionContext[] = [];

    public onAction(ctx: ActionContext) {
        this.actionContexts.push(ctx);
    }
}
```

We collect all incoming actions and complete them all at once, when the action is complete.

::: info
Regardles of which implementation is used, it is important that after the action is completed that
the action object is cleared away, e.g. by setting it to `null` or remove it out of the array.
:::
