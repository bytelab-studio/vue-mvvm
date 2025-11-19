import type { Todo } from "@/models/todo";

export class TodoService {
    private todos: Todo[];

    public constructor() {
        this.todos = [
            {
                title: "Sample todo",
                description: "This is a sample Todo",
                done: false
            }
        ];
    }

    public getTodos(): Todo[] {
        return this.todos;
    }

    public addTodo(todo: Todo): void {
        this.todos.push(todo);
    }

    public updateTodo(todo: Todo): void {
        // Is done by object ref
    }

    public deleteTodo(todo: Todo): void {
        const idx: number = this.todos.indexOf(todo);
        if (idx >= 0) {
            this.todos.splice(idx, 1);
        }
    }
}