import {readonly, ref, Ref, warn} from "vue";

import {UserControl, type UserControlConstructor, syncio} from "vue-mvvm";

/**
 * A type definition for a valid DialogControl class constructor.
 */
export type DialogControlConstructor<T extends DialogControl = DialogControl, Arguments extends [...unknown[]] = []> = UserControlConstructor<T, Arguments>;

/**
 * Abstract base class for easily managing dialog controls in an application.
 *
 * This class provides core functionality to handle the lifecycle of dialogs, including opening, closing, and destruction.
 * Subclasses must implement `onOpen` and `onClose` methods to define specific behavior when the dialog is requested to open or close.
 */
export abstract class DialogControl extends UserControl implements Disposable {
    public destroyed: Readonly<Ref<boolean>>

    private readonly _destroyed: Ref<boolean>;

    public constructor() {
        super();

        this._destroyed = ref(false);
        this.destroyed = readonly(this._destroyed);
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
        if (this.destroyed.value) {
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
        if (this.destroyed.value) {
            warn("Dialog close was requested, but this dialog has already been destroyed.");
            return;
        }

        await syncio.ensureSync(this.onClose());
    }

    /**
     * Marks the current instance as destroyed. Additionally it will not longer be rendered by the {@link DialogProvider}
     */
    public destroy(): void {
        this._destroyed.value = true;
    }

    public [Symbol.dispose](): void {
        this.destroy();
    }

    public async [Symbol.asyncDispose](): Promise<void> {
        this.destroy();
    }
}
