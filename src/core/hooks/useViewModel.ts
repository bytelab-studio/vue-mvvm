import {onBeforeMount, onBeforeUnmount, onBeforeUpdate, onMounted, onUnmounted, onUpdated, onActivated, onDeactivated} from "vue";
import {ViewModel, type ViewModelConstructor} from "@/ViewModel";

export function useViewModel<T extends ViewModel>(vmCLS: ViewModelConstructor<T>): T {
    const vm: T = new vmCLS();

    useViewModelInstance(vm);

    return vm;
}

export function useViewModelInstance<T extends ViewModel>(vm: T): void {
    onBeforeMount(() => vm.beforeMount());
    onMounted(() => vm.mounted());

    onBeforeUpdate(() => vm.beforeUpdate());
    onUpdated(() => vm.beforeUpdate());

    onBeforeUnmount(() => vm.beforeUnmount());
    onUnmounted(() => vm.unmounted());

    onActivated(() => vm.activated());
    onDeactivated(() => vm.deactivated());
}