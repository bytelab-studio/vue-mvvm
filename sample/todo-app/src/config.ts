import type { AppShell, WritableGlobalContext } from "vue-mvvm";
import { TodoService } from "./services/todo.service";
import { MainViewModel } from "./views/MainView";

export class AppConfig implements AppShell {
    router = { 
        views: [
            MainViewModel
        ] 
    }

    configureServices(ctx: WritableGlobalContext): void {
        ctx.registerService("todo.service", new TodoService());
    }
}