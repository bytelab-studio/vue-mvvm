import {onBeforeMount, onBeforeUnmount, onBeforeUpdate, onMounted, onUnmounted, onUpdated, onActivated, onDeactivated} from "vue";
import {ViewModel, type ViewModelConstructor} from "@/ViewModel";

export function useViewModel<T extends ViewModel>(vmCLS: ViewModelConstructor<T>): T {
    const vm: T = new vmCLS();

    onBeforeMount(() => vm.beforeMount());
    onMounted(() => vm.mounted());

    onBeforeUpdate(() => vm.beforeUpdate());
    onUpdated(() => vm.beforeUpdate());

    onBeforeUnmount(() => vm.beforeUnmount());
    onUnmounted(() => vm.unmounted());

    onActivated(() => vm.activated());
    onDeactivated(() => vm.deactivated());

    return vm;
}