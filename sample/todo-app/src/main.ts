import { createApp } from "vue"
import { createMVVM, MVVMApp } from "vue-mvvm";
import { AppConfig } from "./config";

const app = createApp(MVVMApp);
app.use(createMVVM(new AppConfig()));
app.mount("#app");
