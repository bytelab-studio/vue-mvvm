import {Action, ActionContext, MVVMError} from "vue-mvvm";
import {DialogControl, DialogControlConstructor} from "@/DialogControl";
import {AlertOptions} from "@/AlertControl";

export interface ConfirmOptions {
    title: string;
    description: string;
}

export type ConfirmControlConstructor<T extends ConfirmControl = ConfirmControl> = DialogControlConstructor<T, [AlertOptions]>;

export abstract class ConfirmControl extends DialogControl implements Action<boolean> {
    protected readonly title: string = this.computed(() => this.options.title);
    protected readonly description: string = this.computed(() => this.options.description);
    protected readonly options: AlertOptions;

    public constructor(options: AlertOptions) {
        super();

        this.options = this.ref(options);
    }

    public abstract onAction(ctx: ActionContext<boolean>): void | Promise<void>;
}

export class ConfirmComponentNotFoundError extends MVVMError {
    constructor() {
        super(
            `No ConfirmControl was found.` +
            MVVMError.hint(
                "Did you forget to set it in you AppShell config?"
            )
        );
    }
}
