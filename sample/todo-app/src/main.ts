import { createApp } from "vue"
import { useMVVM } from "vue-mvvm";
import { MVVMApp } from "vue-mvvm/router";
import { AppConfig } from "./config";

const app = createApp(MVVMApp);

useMVVM(app, new AppConfig());

app.mount("#app")
