# UserControl

- [UserControl](#usercontrol)
    - [When to Use UserControls](#when-to-use-usercontrols)
    - [When to not Use UserControls](#when-to-not-use-usercontrols)
    - [Access UserControls from ViewModels](#access-usercontrols-from-viewmodels)

A UserControl is a specialized ViewModel designed for reusable UI components that contain
significant presentation logic. The class serves as an abstraction layer when UI logic becomes too
complex to maintain within a single ViewModel.

## When to Use UserControls

UserControls are appropriate when:

- A section of UI requires complex state management (e.g multi-step forms, data tables with filtering/sorting)
- The same UI component needs to be reused across multiple ViewModels
- A UI section needs to communicate results back to its parent ViewModel (typically via the `Action` interface)
- Separation of concerns would benefit from isolating a UI section's logic

UserControls differ from standard Vue components in that they follow the MVVM pattern with full access to the
framework's features (lifecycle hooks, dependency injection, action execution)

## When to not Use UserControls

UserControls are **not** appropriate when:

- Used as a simple design wrapper for basic components (inputs, buttons etc.)

For those cases, normal Vue component, with props and event binding, must be used.

## Access UserControls from ViewModels

Parent ViewModels access UserControl instances using the `getUserControl` protected method,
which retrieves them via Vue template refs.

```vue
<!-- ChildControl.vue -->
<template>
</template>

<script setup lang="ts">
    const vm = useUserControl(ChildControlModel);
</script>
```

```typescript
// ChildControl.model.ts
export class ChildControlModel extends UserControl {
    public counter: number = this.ref(0);

    public increment(): void {
        this.counter++;
    }
}
```

```vue
<!-- ParentView.vue -->
<template>
    <ChildControl ref="myChildControl"/>
</template>

<script setup lang="ts">
    const vm = useViewModel(ParentViewModel);
</script>

```

```typescript
// ParentView.model.ts
export class ParentViewModel extends ViewModel {
    public myChildControl: ChildControlModel | null = this.getUserControl<ChildControlModel>("myChildControl");

    public mounted() {
        // myChildControl is first available onMounted and afterwards
        console.log(this.myChildControl.counter);
        console.log(this.myChildControl.increment());
        console.log(this.myChildControl.counter);
    }
}
```

myChildControl is a computed field that resolves to the exposed models of the Vue's template ref.

If the template ref cannot be retrieved it returns `null`.

::: info
When the ChildControl is mounted inside a `v-for` then `getUserControl` returns an array.
:::
