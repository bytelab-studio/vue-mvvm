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
 * Binds a ViewModel to the current View
 *
 * @param cls - The ViewModel that should be instantiated
 *
 * @returns A instance of the given ViewModel class
 */
export function useViewModel<T extends ViewModel>(cls: ViewModelConstructor<T>): T {
    const vm: T = new cls();

    useViewModelInstance(vm);

    return vm;
}

/**
 * @internal
 */
export function useViewModelInstance(vm: ViewModel): void {
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