import {defineComponent, h, Fragment} from "vue";
import {RouterView} from "vue-router";
import { DialogProvider } from "@provider/DialogProvider";

/**
 * Can be used as the application entry point, when no further App layouting is required.
 *
 * This component sets up the primary structure of the application with routing and various providers.
 *
 * @example createApp(MVVMApp).mount("#app");
 *
 */
export const MVVMApp = defineComponent({
    setup() {
        return () => h(Fragment, null, [
            h(RouterView),
            h(DialogProvider)
        ]);
    }
});