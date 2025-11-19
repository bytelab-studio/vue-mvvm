import { ref, type Component, type Ref } from "vue";
import { ViewModel } from "vue-mvvm";
import type { RouteAdapter, RouterService } from "vue-mvvm/router";

import CreationView from "./CreationView.vue";
import type { TodoService } from "@/services/todo.service";
import { MainViewModel } from "./MainView";

export class CreationViewModel extends ViewModel {
    public static component: Component = CreationView;
    public static route: RouteAdapter = {
        path: "/create"
    }

    public title: Ref<string> = ref("");
    public description: Ref<string> = ref("");
    
    private readonly todoService: TodoService;
    private readonly router: RouterService;

    public constructor() {
        super();

        this.todoService = this.ctx.getService("todo.service");
        this.router = this.ctx.getService("router");
    }

    mounted(): void | Promise<void> {
        this.title.value = "";
        this.description.value = "";
    }

    public async onSubmit(): Promise<void> {
        this.todoService.addTodo({
            title: this.title.value,
            description: this.description.value,
            done: false
        });

        this.router.navigateTo(MainViewModel);
    }
}