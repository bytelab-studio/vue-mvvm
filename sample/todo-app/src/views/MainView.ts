import {type Component, computed, type ComputedRef, ref, type Ref} from "vue";
import {type ActionResult, DialogService, ViewModel} from "vue-mvvm";
import {type RouteAdapter, RouterService} from "vue-mvvm/router";

import MainView from "@/views/MainView.vue";
import {TodoService} from "@/services/todo.service";
import type {Todo} from "@/models/todo";
import {CreationViewModel} from "./CreationView";
import {EditDialogControl} from "@/controls/EditDialog.ts";


export class MainViewModel extends ViewModel {
    public static component: Component = MainView;
    public static route: RouteAdapter = {
        path: "/"
    }

    private dialog: DialogService;
    private router: RouterService;
    private todoService: TodoService;
    private todos: Todo[] = this.ref([]);

    public finishedTodos: Todo[] = this.computed(() => this.todos.filter(todo => todo.done));
    public unfinishedTodos: Todo[] = this.computed(() => this.todos.filter(todo => !todo.done));

    public constructor() {
        super();

        this.router = this.ctx.getService(RouterService);
        this.dialog = this.ctx.getService(DialogService);
        this.todoService = this.ctx.getService(TodoService);
    }

    mounted(): void | Promise<void> {
        this.todos = this.todoService.getTodos();
    }

    public markAsComplete(todo: Todo): void {
        todo.done = true;
        this.todoService.updateTodo(todo);
    }

    public openCreation(): void {
        this.router.navigateTo(CreationViewModel)
    }

    public async openEditModal(todo: Todo): Promise<void> {
        const dialog: EditDialogControl = this.dialog.initDialog(EditDialogControl, todo);
        await dialog.openDialog();

        const result: ActionResult<Todo> = await this.runAction(dialog);
        if (result.success) {
            const editedTodo: Todo = result.data;
            todo.title = editedTodo.title;
            todo.description = editedTodo.description;
            todo.done = editedTodo.done;
            this.todoService.updateTodo(todo);
        }

        await dialog.closeDialog();
        dialog.destroy();
    }
}