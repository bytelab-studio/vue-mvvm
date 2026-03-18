import {Component, warn} from "vue";

import {syncio, UserControl, type UserControlConstructor} from "vue-mvvm";

/**
 * A type definition for a valid DialogControl class constructor.
 */
export type DialogControlConstructor<T extends DialogControl = DialogControl, Arguments extends [...unknown[]] = []> =
    UserControlConstructor<T, Arguments> & {
        readonly component: Component
    };

/**
 * Abstract base class for easily managing dialog controls in an application.
 *
 * This class provides core functionality to handle the lifecycle of dialogs, including opening, closing, and destruction.
 * Subclasses must implement `onOpen` and `onClose` methods to define specific behavior when the dialog is requested to open or close.
 */
export abstract class DialogControl extends UserControl implements Disposable {
    private _destroyed: boolean = this.ref(false);

    public readonly destroyed: boolean = this.computed(() => this._destroyed);


    public constructor() {
        super();
    }

    /**
     * Is executed when opening the dialog was requested
     */
    protected abstract onOpen(): void | Promise<void>;

    /**
     * Is executed when closing  the dialog was requested
     */
    protected abstract onClose(): void | Promise<void>;

    /**
     * Requests the dialog to open
     *
     * If the dialog has been destroyed, a warning is logged, and the method exits.
     */
    public async openDialog(): Promise<void> {
        if (this.destroyed) {
            warn("Dialog open was requested, but this dialog has already been destroyed.");
            return;
        }

        await syncio.ensureSync(this.onOpen());
    }

    /**
     * Requests the dialog to close, can be safely closed from the
     * inheriting class for closing the dialog from the inside.
     *
     * If the dialog has been destroyed, a warning is logged, and the method exits.
     */
    public async closeDialog(): Promise<void> {
        if (this.destroyed) {
            warn("Dialog close was requested, but this dialog has already been destroyed.");
            return;
        }

        await syncio.ensureSync(this.onClose());
    }

    /**
     * Marks the current instance as destroyed. Additionally it will not longer be rendered by the {@link DialogProvider}
     */
    public destroy(): void {
        this._destroyed = true;
    }

    public [Symbol.dispose](): void {
        this.destroy();
    }

    public async [Symbol.asyncDispose](): Promise<void> {
        this.destroy();
    }
}
