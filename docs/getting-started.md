# Getting Started

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Initialization Steps](#initialization-steps)
    - [1. Create a Vue Application](#1-create-a-vue-application)
    - [2. Install Package](#2-install-package)
    - [3. Create AppShell](#3-create-appshell)
    - [4. Initialize Vue with MVVM](#4-initialize-vue-with-mvvm)
  - [File Structure](#file-structure)
  - [MVVMApp Component](#mvvmapp-component)

## Prerequisites

The framework requires the following peer dependencies:

| Dependency   | Version | Purpose                                  |
| ------------ | ------- | ---------------------------------------- |
| `vue`        | ^3.5.24 | Vue 3 framework runtime                  |
| `vue-router` | ^4.6.3  | Required only if using `vue-mvvm/router` |

**Note:** The router dependency is optional and only needed if you plan to use the router extension described in [Router Extension](/extensions/router).

## Initialization Steps

### 1. Create a Vue Application

Create a new Vue application and select any features you want.

```shell
npm create vue@latest
```

::: info
It is recommended to enable TypeScript support.
:::

### 2. Install the Package

Use npm (or any other package manager) to install `vue-mvvm`.

```shell
npm install vue-mvvm
```

### 3. Create the AppShell

Implement the `AppShell` interface to configure services and plugins.

```typescript
// config.ts
import type {AppShell, WritableGlobalContext} from "vue-mvvm";

export class AppConfig implements AppShell {
    configureService(ctx: WritableGlobalContext): void {
        // Register and mock services
    }
}

// or alternatively
export const AppConfig = {
    configureService(ctx: WritableGlobalContext): void {
        // Register and mock services
    }
} satisfies AppShell;
```

### 4. Initialize Vue with MVVM

```typescript
// main.ts
import {createApp, type App} from "vue";
import {createMVVM} from "vue-mvvm";
import {AppConfig} from "./config";
import App from "./App.vue";

const app: App = createApp(App);

app.use(createMVVM(new AppConfig()));
// or
app.use(createMVVM(AppConfig));

app.mount("#app");
```

## File Structure

```text
project/
├── src/
│   ├── main.ts                 # Application entry point
│   ├── config.ts               # AppShell configuration
│   ├── App.vue                 # Entry component
│   ├── controls/
│   │   ├── FormControl.vue     # UserControl
│   │   └── FormControl.model.ts # ViewModel of the UserControl
│   └── views/
│       ├── MainView.vue        # View 
│       └── MainView.model.ts   # ViewModel
└── package.json
```

## MVVMApp Component

If you use `vue-router` and don't need a special layout for the `App` component,
you can use the built-in `MVVMApp` component as the root component.

```typescript
// main.ts
import {createApp, type App} from "vue";
import {createMVVM} from "vue-mvvm";          // [!code --]
import {createMVVM, MVVMApp} from "vue-mvvm"; // [!code ++]
import {AppConfig} from "./config";
import App from "./App.vue";                  // [!code --]

const app: App = createApp(App);     // [!code --]
const app: App = createApp(MVVMApp); // [!code ++]

app.use(createMVVM(new AppConfig()));
// or
app.use(createMVVM(AppConfig));

app.mount("#app");
```

The `MVVMApp` will also mount any registered providers from plugins.
For example, `DialogProvider` will be mounted when `vue-mvvm/dialog` is used.