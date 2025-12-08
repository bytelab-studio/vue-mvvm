# Router

- [Router](#router)
  - [Configuration](#configuration)
    - [History Strategies](#history-strategies)

The router extension extends the base MVVM capabilities with routing functionality by:

- Defining a `RoutableViewModel` type that associates ViewModels with route paths
- Providing `RouterSerivce` for ViewModel-centric navigation
- Implementing route guards declaratively on ViewModel classes
- Automatically configure `vue-router` during application initialization

## Configuration

The router extension extends `AppShell` interface via TypeScript interface merging to 
add router specific configuration.

| Property  | Type                              | Description                                               |
| --------- | --------------------------------- | --------------------------------------------------------- |
| `history` | `"memory" \| "web" \| "web-hash"` | Router history strategy. Defaults to `web`                |
| `views`   | `RoutableViewModel[]`             | Array of ViewModel constructors with routing information. |

### History Strategies

- `"memory"`: In-memory history for server-side rendering
- `"web"`: HTML5 History API for standard single-page applications
- `"web-hash"`: Hash-based history for environments without server configuration (e.g., `file://` protocol)
