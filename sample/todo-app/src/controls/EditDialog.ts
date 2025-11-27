import {type Component, ref, type Ref} from "vue";
import {DialogControl, type Action, ActionContext} from "vue-mvvm";

import EditDialog from "@/controls/EditDialog.vue";
import type {Todo} from "@/models/todo.ts";

export class EditDialogControl extends DialogControl implements Action<Todo>{
    public static readonly component: Component = EditDialog;

    private actionContext: ActionContext<Todo> | null;

    public readonly todo: Todo;
    public title: string;
    public description: string;
    public done: boolean;

    public constructor(todo: Todo) {
        super();

        this.actionContext = null;

        this.todo = todo;

        this.title = this.ref(todo.title);
        this.description = this.ref(todo.description);
        this.done = this.ref(todo.done);
    }

    public mounted(): void | Promise<void> {
    }

    protected onOpen(): void | Promise<void> {
    }

    protected onClose(): void | Promise<void> {
        if (this.actionContext) {
            this.actionContext.failAction("Dialog was closed");
        }
    }

    public onAction(ctx: ActionContext<Todo>): void | Promise<void> {
        this.actionContext = ctx;
    }

    public onSubmit(): void {
        if (!this.actionContext) {
            return;
        }

        this.actionContext.completeAction({
            title: this.title,
            description: this.description,
            done: this.done
        });
        this.actionContext = null;
    }

    public async onCancel(): Promise<void> {
        await this.closeDialog();
        this.destroy();
    }
}