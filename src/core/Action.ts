import {warn} from "vue";

/**
 * Represents a unit of work or operation that eventually produces a result.
 *
 * Actions are typically executed within a {@link ViewModel} using {@link ViewModel.runAction}.
 * This pattern is particularly useful for delegating interactive tasks—such as filling out a form—
 * to a {@link UserControl}. It allows the parent ViewModel to await the result of the user's
 * interaction without managing the specific UI logic or state of that control.
 *
 * @example
 * // A UserControl implementing Action to handle a form submission
 * class LoginForm extends UserControl implements Action<LoginCredentials> {
 *   private ctx?: ActionContext<LoginCredentials>;
 *
 *   public onAction(ctx: ActionContext<LoginCredentials>): void {
 *     this.ctx = ctx;
 *     // Optional: logic to reset form state or focus input
 *   }
 *
 *   public async onSubmit(): Promise<void> {
 *     // ... validation logic ...
 *     this.ctx?.completeAction({
 *         username: this.username.value,
 *         password: this.password.value
 *     });
 *   }
 * }
 *
 * // Usage in a parent ViewModel
 * async startLogin(): Promise<void> {
 *   const result = await this.runAction(this.loginForm);
 *   if (result.success) {
 *      // Handle successful login data
 *   }
 * }
 *
 */
export interface Action<T> {
    /**
     * Called when the action execution is initiated by an external {@link ViewModel} via {@link ViewModel.runAction}.
     *
     * This method receives a new {@link ActionContext} representing the current execution flow.
     *
     * @remarks
     * It is semantically possible for this method to be called multiple times on the same instance
     * (e.g., if the caller does not await the previous `runAction` call). Implementations should decide
     * whether to support concurrent executions or replace the active context (last-one-wins).
     *
     * @param ctx - The context object specific to this execution run, used to resolve or fail the action.
     */
    onAction(ctx: ActionContext<T>): void | Promise<void>;
}

/**
 * Represents the result of an action that can either succeed with data or fail with an error.
 */
export type ActionResult<T> =
    | { success: true, data: T }
    | { success: false, error: Error | any }

/**
 * Represents the context for executing an action, allowing the action to be completed successfully
 * or failed with an error.
 *
 * This context ensures that an action transaction can only be resolved once.
 */
export class ActionContext<T> {
    private transactionClose: boolean;
    private readonly resolve: (data: ActionResult<T>) => void;

    /**
     * @internal
     */
    public constructor(resolve: (data: ActionResult<T>) => void) {
        this.transactionClose = false;
        this.resolve = resolve;
    }

    /**
     * Completes the current action and resolves it with the provided data.
     *
     * Ensures that the action is not marked as complete more than once.
     * This will also cause that a waiting {@link ViewModel} that called
     * {@link ViewModel.runAction} will continue its execution.
     *
     * @param data - The data to be passed when resolving the action.
     */
    public completeAction(data: T): void {
        if (this.transactionClose) {
            warn("Attempted to complete action, but this action transaction is already closed. (Hint: Call completeAction or failAction exactly once per action.)");
            return;
        }

        this.transactionClose = true;
        this.resolve({
            success: true,
            data: data
        });
    }

    /**
     * Completes the current action and resolves it with the provided error.
     *
     * Ensures that the action is not marked as complete more than once.
     * This will also cause that a waiting {@link ViewModel} that called
     * {@link ViewModel.runAction} will continue its execution.
     *
     * @param error - Optional error object or message to provide additional details about the failed action.
     */
    public failAction(error?: any): void {
        if (this.transactionClose) {
            warn("Attempted to fail action, but this action transaction is already closed. (Hint: Ensure you don't call failAction after a prior completion/failure.)");
        }

        if (typeof error == "undefined") {
            error = new Error("Action failed, but no error was provided");
        }

        this.transactionClose = true;
        this.resolve({
            success: false,
            error: error
        });
    }
}