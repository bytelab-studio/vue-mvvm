import {warn} from "vue";

export interface Action<T> {
    onAction(ctx: ActionContext<T>): void | Promise<void>;
}

export class ActionContext<T> {
    private transactionClose: boolean;
    private readonly resolve: (data: T) => void;
    private readonly reject: (error?: any) => void;

    public constructor(resolve: (data: T) => void, reject: (error?: any) => void) {
        this.transactionClose = false;
        this.resolve = resolve;
        this.reject = reject;
    }

    public completeAction(data: T): void {
        if (this.transactionClose) {
            warn("Attempted to complete action, but this action transaction is already closed. (Hint: Call completeAction or failAction exactly once per action.)");
            return;
        }

        this.transactionClose = true;
        this.resolve(data);
    }

    public failAction(error?: any): void {
        if (this.transactionClose) {
            warn("Attempted to fail action, but this action transaction is already closed. (Hint: Ensure you don't call failAction after a prior completion/failure.)");
        }

        this.transactionClose = true;
        this.reject(error);
    }
}