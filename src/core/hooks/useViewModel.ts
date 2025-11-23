import {onBeforeMount, onBeforeUnmount, onBeforeUpdate, onMounted, onUnmounted, onUpdated, onActivated, onDeactivated} from "vue";
import {ViewModel, type ViewModelConstructor} from "@/ViewModel";

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
    onUnmounted(() => vm.unmounted());

    onActivated(() => vm.activated());
    onDeactivated(() => vm.deactivated());
}