# Delegate

- [Delegate](#delegate)
    - [Overview](#overview)
    - [Modes](#modes)
    - [API Reference](#api-reference)
    - [Example Usage](#example-usage)

The Delegate system provides a type-safe way to implement the observer pattern, allowing multiple subscribers to react
to events or method calls.

## Overview

A `Delegate` maintains a list of subscribers and can invoke them either sequentially or in parallel. It supports both
synchronous and asynchronous callbacks.

## Modes

The `Delegate` can operate in two modes:

| Mode                      | Description                                                                             |
|---------------------------|-----------------------------------------------------------------------------------------|
| `DelegateMode.SEQUENTIAL` | (Default) Invokes subscribers one after another, awaiting each if it returns a promise. |
| `DelegateMode.PARALLEL`   | Invokes all subscribers concurrently using `Promise.allSettled`.                        |

## API Reference

### `Delegate<Arguments>`

- `constructor(mode?: DelegateMode)`: Initializes a new delegate with the specified mode.
- `subscribe(cb: DelegateCallback<Arguments>): DelegateRevoke`: Subscribes a callback and returns a function to
  unsubscribe.
- `invoke(...args: Arguments): Promise<void>`: Invokes all subscribers with the provided arguments.
- `dispose(): void`: Removes all subscribers.

## Example Usage

```typescript
import {Delegate, DelegateMode} from 'vue-mvvm';

// Define a delegate that accepts a string argument
const onMessage = new Delegate<[string]>(DelegateMode.SEQUENTIAL);

// Subscribe to messages
const revoke = onMessage.subscribe((msg) => {
    console.log(`Received: ${msg}`);
});

// Invoke the delegate
await onMessage.invoke("Hello World");

// Unsubscribe
revoke();
```

### Usage in ViewModels

Delegates are often used to expose events from services or between ViewModels.

```typescript
export class ChatService {
    public readonly onNewMessage = new Delegate<[Message]>();
}

export class ChatViewModel extends ViewModel {
    private readonly chatService: ChatService;

    constructor() {
        super();
        this.chatService = this.ctx.getService(ChatService);
    }

    protected mounted() {
        // Subscribe and ensure we cleanup on unmount
        const revoke = this.chatService.onNewMessage.subscribe(msg => this.handleMessage(msg));

        // Note: In a real scenario, you might want to track this revoke 
        // to call it in beforeUnmount.
    }
}
```
