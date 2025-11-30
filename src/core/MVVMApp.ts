import {defineComponent, h, Fragment} from "vue";

import {type ReadableGlobalContext, useGlobalContext} from "@/context";

/**
 * Can be used as the application entry point, when no further App layouting is required.
 *
 * This component sets up a fragment with all registered providers
 */
export const MVVMApp = defineComponent({
    setup() {
        const ctx: ReadableGlobalContext = useGlobalContext(true);

        return () => h(Fragment, null, ctx.getProviders().map(providers  => h(providers)));
    }
});
