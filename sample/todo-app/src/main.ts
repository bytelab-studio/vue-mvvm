import { createApp } from "vue"
import App from "./App.vue"
import { useMVVM } from "vue-mvvm";

const app = createApp(App);

// Initialize MVVM for this app. Users can also bind services here, e.g.:
// useMVVM(app).bind('todoService', new TodoService())
useMVVM(app);

app.mount("#app")
