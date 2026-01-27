import {Action, ActionContext, MVVMError} from "vue-mvvm";
import {DialogControl, DialogControlConstructor} from "@/DialogControl";

export interface AlertOptions {
    title: string;
    description: string;
}

export type AlertControlConstructor<T extends AlertControl = AlertControl> = DialogControlConstructor<T, [AlertOptions]>;

export abstract class AlertControl extends DialogControl implements Action<void> {
    protected readonly title: string = this.computed(() => this.options.title);
    protected readonly description: string = this.computed(() => this.options.description);
    protected readonly options: AlertOptions;

    public constructor(options: AlertOptions) {
        super();

        this.options = this.ref(options);
    }

    public abstract onAction(ctx: ActionContext<void>): void | Promise<void>;
}

export class AlertComponentNotFoundError extends MVVMError {
    constructor() {
        super(
            `No AlertControl was found.` +
            MVVMError.hint(
                "Did you forget to set it in you AppShell config?"
            )
        );
    }
}
