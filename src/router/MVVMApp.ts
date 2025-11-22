import {defineComponent, h, Fragment} from "vue";
import {RouterView} from "vue-router";
import { DialogProvider } from "@provider/DialogProvider";

export const MVVMApp = defineComponent({
    setup() {
        return () => h(Fragment, null, [
            h(RouterView),
            h(DialogProvider)
        ]);
    }
});