import { createApp } from "vue"
import { createMVVM } from "vue-mvvm";
import { MVVMApp } from "vue-mvvm/router";
import { AppConfig } from "./config";

const app = createApp(MVVMApp);
app.use(createMVVM(new AppConfig()));
app.mount("#app")
