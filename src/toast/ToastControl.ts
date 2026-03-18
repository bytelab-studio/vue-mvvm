import {Component} from "vue";
import {syncio, UserControl, UserControlConstructor} from "vue-mvvm";

import {InfoToastOptions, ProgressToastOptions, ToastOptions} from "@/ToastService";

/**
 * A type definition for a valid ToastControl class constructor.
 */
export type ToastControlConstructor<
    Options extends ToastOptions = ToastOptions,
    T extends ToastControl<Options> = ToastControl<Options>,
    Arguments extends [...unknown[]] = []
> =
    UserControlConstructor<T, [Options, ...Arguments]> & {
    /**
     * The Vue component associated with this toast.
     */
    readonly component: Component
};

/**
 * A type definition for an InfoToastControl class constructor.
 */
export type InfoToastConstructor<
    T extends InfoToastControl = InfoToastControl
> = ToastControlConstructor<InfoToastOptions, T>;

/**
 * A type definition for a ProgressToastControl class constructor.
 */
export type ProgressToastConstructor<
    T extends ProgressToastControl = ProgressToastControl
> = ToastControlConstructor<ProgressToastOptions, T>;

/**
 * Abstract base class for easily managing toasts in an application.
 */
export abstract class ToastControl<Options extends ToastOptions = ToastOptions> extends UserControl {
    private _destroyed: boolean = this.ref(false);

    protected readonly options: Options;

    public readonly destroyed: boolean = this.computed(() => this._destroyed);
    public readonly title: string = this.computed(() => this.options.title);
    public readonly description: string = this.computed(() => this.options.description);
    public readonly type: Options["type"] = this.computed(() => this.options.type);

    public constructor(options: Options) {
        super();

        this.options = this.readonly(options);
    }

    /**
     * Called when the toast is being destroyed.
     */
    protected onDestroy(): Promise<void> | void {
    }

    /**
     * Destroys the toast and removes it from the screen.
     */
    public async destroy(): Promise<void> {
        await syncio.ensureSync(this.onDestroy());
        this._destroyed = true;
    }
}

/**
 * A specialized {@link ToastControl} for displaying informational messages that automatically disappear.
 */
export abstract class InfoToastControl extends ToastControl<InfoToastOptions> {
    /**
     * The default duration (in milliseconds) before the toast is automatically destroyed.
     */
    public static DEFAULT_DURATION: number = 5000;

    private timeoutId: number = -1;

    protected readonly duration: number = this.computed(() => this.options.duration ?? InfoToastControl.DEFAULT_DURATION);

    protected mounted(): void {
        if (this.destroyed) {
            return;
        }

        this.timeoutId = setTimeout(async () => {
            this.timeoutId = -1;
            await this.destroy();
        }, this.duration) as unknown as number;
    }

    protected unmounted(): void {
        if (this.timeoutId != -1) {
            clearTimeout(this.timeoutId);
            this.timeoutId = -1;
        }
    }
}

/**
 * A specialized {@link ToastControl} for displaying progress-related information.
 */
export abstract class ProgressToastControl extends ToastControl<ProgressToastOptions> implements Disposable, AsyncDisposable {
    private timeoutId: number = -1;

    public value: number = this.ref(0);

    public readonly isIntermediate: boolean = this.computed(() => !!this.options.indeterminate);
    public readonly max: number = this.computed(() => this.options.max ?? 0);
    public readonly percentage: number = this.computed(() => {
        if (this.max == 0) {
            return 0;
        }

        return Math.round(this.value / this.max * 100_00) / 100;
    });

    protected unmounted(): void {
        if (this.timeoutId != -1) {
            clearTimeout(this.timeoutId);
            this.timeoutId = -1;
        }
    }

    /**
     * Schedules the toast to be destroyed after the specified delay.
     *
     * @param milliseconds - The delay in milliseconds. Defaults to 5000.
     */
    public destroyAfter(milliseconds: number = 5000): void {
        if (this.timeoutId != -1) {
            clearTimeout(this.timeoutId);
        }

        this.timeoutId = setTimeout(async () => {
            this.timeoutId = -1;
            await this.destroy();
        }, milliseconds) as unknown as number;
    }

    public [Symbol.dispose](): void {
        if (this.timeoutId == -1) {
            this.destroyAfter();
        }
    }

    public async [Symbol.asyncDispose](): Promise<void> {
        if (this.timeoutId == -1) {
            this.destroyAfter();
        }
    }
}