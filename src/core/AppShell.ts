import type { WritableGlobalContext } from "@hook/useGlobalContext";

/**
 * Represents the configuration shell of an MVVM application.
 *
 * Might be extended by interface mergin of optional parts e.g. `vue-mvvm/router`
 */
export interface AppShell {
    /**
     * Is called to register services in the DI and to mock them if required.
     *
     * @param ctx - Represents a global context for features like DI
     */
    configureServices(ctx: WritableGlobalContext): void
}