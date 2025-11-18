import type { App } from "vue";
import { useGlobalContext, type WritableGlobalContext } from "@hook/useGlobalContext";

export interface MVVMApi {
    /**
     * Bind a concrete service instance to a key in the global MVVM service container.
     * Returns this API to allow chaining.
     */
    bind(key: string, service: object): MVVMApi;

    /**
     * Replace an already registered service with a mock (or another implementation).
     * Returns this API to allow chaining.
     */
    mock(key: string, service: object): MVVMApi;

    /**
     * Read a service from the container. Useful when configuring with existing services.
     */
    getService<T extends object>(key: string): T;

    /**
     * Open-ended configuration hook for future extensions. For now, it stores
     * configuration options for potential consumers (plugins, future features, etc.).
     * Returns this API to allow chaining.
     */
    configure(options: Record<string, unknown>): MVVMApi;
}

/**
 * Initializes and configures the MVVM system for the given Vue application.
 * Must be called in the user's main.ts and accepts the Vue App as parameter.
 *
 * Responsibilities:
 * 1. Bind services to the global context.
 * 2. Allow mocking of services afterwards.
 * 3. Be open for future configuration.
 */
export function useMVVM(app: App): MVVMApi {
    const ctx: WritableGlobalContext = useGlobalContext();

    // Simple in-memory config store to keep future options without breaking API.
    const config: Record<string, unknown> = {};

    const api: MVVMApi = {
        bind(key: string, service: object): MVVMApi {
            ctx.registerService(key, service);
            return api;
        },

        mock(key: string, service: object): MVVMApi {
            ctx.mockService(key, service);
            return api;
        },

        getService<T extends object>(key: string): T {
            return ctx.getService<T>(key);
        },

        configure(options: Record<string, unknown>): MVVMApi {
            Object.assign(config, options);
            return api;
        }
    };

    // Expose the API on the Vue app instance so users can mock or configure later.
    // This keeps it accessible throughout the app lifecycle.
    // Using a non-enumerable property name to minimize potential collisions.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (app.config.globalProperties as any).$mvvm = api;

    return api;
}
