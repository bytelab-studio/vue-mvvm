import {defineComponent, h} from "vue";
import {RouterView, useRoute} from "vue-router";

/**
 * RouterProvider is a Vue.js component that wraps the RouterView.
 *
 * It ensures that the RouterView is re-rendered when the route path changes by using the path as a key.
 */
export const RouterProvider = defineComponent({
    name: "RouterProvider",
    setup() {
        const route = useRoute();
        return () => h(RouterView, {
            key: route.path
        });
    }
});
