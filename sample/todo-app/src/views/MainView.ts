import {ref, type Component, type Ref} from "vue";
import {ViewModel} from "vue-mvvm";
import type {RouterService, RouteAdapter} from "vue-mvvm/router";

import MainView from "@/views/MainView.vue";
import type {TodoService} from "@/services/todo.service";
import type {Todo} from "@/models/todo";
import { CreationViewModel } from "./CreationView";


export class MainViewModel extends ViewModel {
    public static component: Component = MainView;
    public static route: RouteAdapter = {
        path: "/dashboard"
    }

    private router: RouterService;
    private todoService: TodoService;
    public todos: Ref<Todo[]> = ref([]);

    public constructor() {
        super();

        this.router = this.ctx.getService("router");
        this.todoService = this.ctx.getService("todo.service");
    }

    mounted(): void | Promise<void> {
        this.todos.value = this.todoService.getTodos();
    }

    public markAsComplete(todo: Todo): void {
        todo.done = true;
        this.todoService.updateTodo(todo);
    }

    public openCreation(): void {
        this.router.navigateTo(CreationViewModel)
    }
}