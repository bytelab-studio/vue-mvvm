import * as syncio from "@/syncio";
import { UserControl, type UserControlConstructor } from "@/UserControl";
import {readonly, ref, Ref, warn} from "vue";

export type DialogControlConstructor<T extends DialogControl = DialogControl, Arguments extends [...unknown[]] = []> = UserControlConstructor<T, Arguments>;

export abstract class DialogControl extends UserControl implements Disposable {
    public destroyed: Readonly<Ref<boolean>>

    private _destroyed: Ref<boolean>;

    public constructor() {
        super();

        this._destroyed = ref(false);
        this.destroyed = readonly(this._destroyed);
    }

    protected abstract onOpen(): void | Promise<void>;
    protected abstract onClose(): void | Promise<void>;

    public async openDialog(): Promise<void> {
        if (this.destroyed.value) {
            warn("Dialog open was requested, but this dialog has already been destroyed.");
            return;
        }

        await syncio.ensureSync(this.onOpen());
    }

    public async closeDialog(): Promise<void> {
        if (this.destroyed.value) {
            warn("Dialog close was requested, but this dialog has already been destroyed.");
            return;
        }

        await syncio.ensureSync(this.onClose());
    }

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
