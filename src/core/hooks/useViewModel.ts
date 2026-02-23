import {
    onActivated,
    onBeforeMount,
    onBeforeUnmount,
    onBeforeUpdate,
    onDeactivated,
    onMounted,
    onUnmounted,
    onUpdated
} from "vue";
import {ViewModel, type ViewModelConstructor} from "@/ViewModel";
import * as syncio from "@/syncio";

/**
 * Used for override protected lifecycle methods in the ViewModel
 */
interface LifecycleHooks {
    beforeMount(): void | Promise<void>;
    mounted(): void | Promise<void>;

    beforeUpdate(): void | Promise<void>;
    updated(): void | Promise<void>;

    beforeUnmount(): void | Promise<void>;
    unmounted(): void | Promise<void>;

    activated(): void | Promise<void>;
    deactivated(): void | Promise<void>;
}

/**
 * Binds a ViewModel to the current View
 *
 * @param cls - The ViewModel that should be instantiated
 *
 * @returns A instance of the given ViewModel class
 */
export function useViewModel<T extends ViewModel>(cls: ViewModelConstructor<T>): T {
    const vm: T = new cls();

    useViewModelInstance(vm as unknown as LifecycleHooks & ViewModel);

    return vm;
}

/**
 * @internal
 */
export function useViewModelInstance(vm: LifecycleHooks & ViewModel): void {
    onBeforeMount(() => vm.beforeMount());
    onMounted(() => vm.mounted());

    onBeforeUpdate(() => vm.beforeUpdate());
    onUpdated(() => vm.updated());

    onBeforeUnmount(() => vm.beforeUnmount());
    onUnmounted(async () => {
        await syncio.ensureSync(vm.unmounted());
        vm.disposeWatchers();
    });

    onActivated(() => vm.activated());
    onDeactivated(() => vm.deactivated());
}