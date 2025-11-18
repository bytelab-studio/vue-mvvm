import {type Component} from "vue";
import {type ReadableGlobalContext, useGlobalContext} from "@hook/useGlobalContext";

export type ViewModelConstructor<T extends ViewModel> =
    (new () => T) &
        {
            readonly component: Component;
        }

export class ViewModel {
    protected readonly ctx: ReadableGlobalContext = useGlobalContext(true);

    public constructor() {
    }

    public beforeMount(): void | Promise<void> {
    }

    public mounted(): void | Promise<void> {
    }

    public beforeUpdate(): void | Promise<void> {
    }

    public updated(): void | Promise<void> {
    }

    public beforeUnmount(): void | Promise<void> {
    }

    public unmounted(): void | Promise<void> {
    }

    public activated(): void | Promise<void> {
    }

    public deactivated(): void | Promise<void> {
    }
}
