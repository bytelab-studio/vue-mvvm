import type { AppShell, WritableGlobalContext } from "vue-mvvm";
import { TodoService } from "./services/todo.service";
import { MainViewModel } from "./views/MainView";
import { CreationViewModel } from "./views/CreationView";

export class AppConfig implements AppShell {
    router = { 
        views: [
            MainViewModel,
            CreationViewModel
        ] 
    }

    configureServices(ctx: WritableGlobalContext): void {
        ctx.registerService(TodoService, () => new TodoService());
    }
}