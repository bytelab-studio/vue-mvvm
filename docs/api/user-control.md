# UserControl

- [UserControl](#usercontrol)
  - [When to Use UserControls](#when-to-use-usercontrols)
  - [When to not Use UserControls](#when-to-not-use-usercontrols)

A UserControl is a specialized ViewModel designed for reusable UI components that contain
significant presentation logic. The class serves as an abstraction layer when UI logic becomes too
complex to maintain within a single ViewModel.

## When to Use UserControls

UserControls are appropriate when:

- A section of UI requires complex state management (e.g multi-step forms, data tables with filtering/sorting)
- The same UI component needs to be reused across multiple ViewModels
- A UI section needs to communicate results back to its parent ViewModel (typically via the `Action` interface)
- Seperation of concerns would benefit from isolating a UI section's logic

UserControls differ from standard Vue components in that they follow the MVVM pattern with full access to the framework's features (lifecycle hooks, dependency injection, action execution)

## When to not Use UserControls

UserControls are **not** appropriate when:

- Used as a simple design wrapper for basic components (inputs, buttons etc.)

For those cases, normal Vue component, with props and event binding, must be used.
