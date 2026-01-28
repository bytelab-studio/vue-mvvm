import {Action, ActionContext, MVVMError} from "vue-mvvm";
import {DialogControl, DialogControlConstructor} from "@/DialogControl";
import {AlertOptions} from "@/AlertControl";

/**
 * Interface of Data that is required to display the confirm.
 * 
 * This interface might be extended through interface merging by the user.
 */
export interface ConfirmOptions {
    title: string;
    description: string;
}

/**
 * A type definition for a valid ConfirmControl class constructor.
 */
export type ConfirmControlConstructor<T extends ConfirmControl = ConfirmControl> = DialogControlConstructor<T, [AlertOptions]>;

/**
 * Abstract base class for implementing an universal Confirm dialog.
 */
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
