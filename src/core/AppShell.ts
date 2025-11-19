import type { WritableGlobalContext } from "@hook/useGlobalContext";

export interface AppShell {
    configureServices(ctx: WritableGlobalContext): void
}