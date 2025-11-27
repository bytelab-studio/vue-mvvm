import {type Component, ref, type Ref} from "vue";
import {ViewModel} from "vue-mvvm";
import {type RouteAdapter, RouterService} from "vue-mvvm/router";

import CreationView from "./CreationView.vue";
import {TodoService} from "@/services/todo.service";
import {MainViewModel} from "./MainView";

export class CreationViewModel extends ViewModel {
    public static component: Component = CreationView;
    public static route: RouteAdapter = {
        path: "/create"
    }

    public title: string = this.ref("");
    public description: string = this.ref("");

    private readonly todoService: TodoService;
    private readonly router: RouterService;

    public constructor() {
        super();

        this.todoService = this.ctx.getService(TodoService);
        this.router = this.ctx.getService(RouterService);
    }

    mounted(): void | Promise<void> {
        this.title = "";
        this.description = "";
    }

    public async onSubmit(): Promise<void> {
        this.todoService.addTodo({
            title: this.title,
            description: this.description,
            done: false
        });

        this.router.navigateTo(MainViewModel);
    }
}