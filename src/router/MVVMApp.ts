import {defineComponent, h} from "vue";
import {RouterView} from "vue-router";

export const MVVMApp = defineComponent({
    setup() {
        return () => h(RouterView);
    }
});